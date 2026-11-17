param(
  [int]$Port = 8080
)

$Root = $PSScriptRoot
$Listener = New-Object System.Net.HttpListener
$Prefix = "http://localhost:$Port/"
$Listener.Prefixes.Add($Prefix)
$Listener.Start()
Write-Output "Hobak local server running at $Prefix"

$MimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".ico"  = "image/x-icon"
}

try {
  while ($Listener.IsListening) {
    $Context = $Listener.GetContext()
    $Req = $Context.Request
    $Res = $Context.Response

    $UrlPath = $Req.Url.LocalPath
    if ($UrlPath -eq "/" -or [string]::IsNullOrEmpty($UrlPath)) {
      $UrlPath = "/index.html"
    }

    # 보안: .env 접근 차단
    if ($UrlPath -match "\.env") {
      $Res.StatusCode = 403
      $Res.Close()
      continue
    }

    $RelPath = $UrlPath.TrimStart('/').Replace('/', '\')
    $FullPath = Join-Path $Root $RelPath

    if (Test-Path $FullPath -PathType Leaf) {
      $Ext = [System.IO.Path]::GetExtension($FullPath).ToLower()
      $Res.ContentType = if ($MimeTypes.ContainsKey($Ext)) { $MimeTypes[$Ext] } else { "application/octet-stream" }
      $Res.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
      $Res.Headers["Pragma"] = "no-cache"
      $Bytes = [System.IO.File]::ReadAllBytes($FullPath)
      $Res.ContentLength64 = $Bytes.Length
      $Res.StatusCode = 200
      $Res.OutputStream.Write($Bytes, 0, $Bytes.Length)
    } else {
      $Res.StatusCode = 404
    }
    $Res.Close()
  }
} finally {
  $Listener.Stop()
}
