$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$publicDir = Join-Path $projectRoot "dist\client"
$shellPath = Join-Path $publicDir "_shell.html"
$htaccessSource = Join-Path $projectRoot "public\.htaccess"

if (-not (Test-Path -LiteralPath $shellPath -PathType Leaf)) {
    throw "SPA shell not found at $shellPath. Run npm run build first."
}

if (-not (Test-Path -LiteralPath (Join-Path $publicDir "assets") -PathType Container)) {
    throw "Built assets are missing from $publicDir. Run npm run build first."
}

if (-not (Test-Path -LiteralPath $htaccessSource -PathType Leaf)) {
    throw "Plesk route fallback file is missing: $htaccessSource"
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss-fff"
$releaseDir = Join-Path ([System.IO.Path]::GetTempPath()) ("vault-frontend-plesk-" + [guid]::NewGuid().ToString("N"))
$archivePath = Join-Path $projectRoot ("vault-frontend-plesk-" + $stamp + ".zip")
New-Item -ItemType Directory -Path $releaseDir | Out-Null
try {
    Get-ChildItem -LiteralPath $publicDir -Force |
        Where-Object { $_.Name -ne "_shell.html" } |
        ForEach-Object {
            Copy-Item -LiteralPath $_.FullName -Destination $releaseDir -Recurse -Force
        }

    Copy-Item -LiteralPath $shellPath -Destination (Join-Path $releaseDir "index.html")
    Copy-Item -LiteralPath $htaccessSource -Destination (Join-Path $releaseDir ".htaccess")

    if (-not (Test-Path -LiteralPath (Join-Path $releaseDir "index.html") -PathType Leaf)) {
        throw "Release is missing index.html."
    }

    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem

    $basePath = $releaseDir.TrimEnd("\", "/") + "\"
    $archive = [System.IO.Compression.ZipFile]::Open(
        $archivePath,
        [System.IO.Compression.ZipArchiveMode]::Create
    )
    try {
        Get-ChildItem -LiteralPath $releaseDir -File -Recurse -Force | ForEach-Object {
            $entryName = $_.FullName.Substring($basePath.Length).Replace("\", "/")
            $entry = $archive.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
            $inputStream = [System.IO.File]::OpenRead($_.FullName)
            try {
                $outputStream = $entry.Open()
                try {
                    $inputStream.CopyTo($outputStream)
                } finally {
                    $outputStream.Dispose()
                }
            } finally {
                $inputStream.Dispose()
            }
        }
    } finally {
        $archive.Dispose()
    }

    $check = [System.IO.Compression.ZipFile]::OpenRead($archivePath)
    try {
        $entries = @($check.Entries | ForEach-Object { $_.FullName })
        if ($entries -notcontains "index.html") {
            throw "ZIP root is missing index.html."
        }
        if ($entries -notcontains ".htaccess") {
            throw "ZIP is missing the hidden .htaccess fallback."
        }
        if ($entries | Where-Object { $_.Contains("\") }) {
            throw "ZIP contains Windows path separators."
        }
        if ($entries | Where-Object { $_ -match "(^|/)\.env($|/)" }) {
            throw "ZIP contains a real .env file."
        }
        if ($entries | Where-Object { $_ -match "(^|/)(src|node_modules|\.output)(/|$)" }) {
            throw "ZIP contains source or build-only directories."
        }
        foreach ($entry in $check.Entries) {
            $stream = $entry.Open()
            try {
                $stream.CopyTo([System.IO.Stream]::Null)
            } finally {
                $stream.Dispose()
            }
        }
    } finally {
        $check.Dispose()
    }
} catch {
    if (Test-Path -LiteralPath $archivePath) {
        Remove-Item -LiteralPath $archivePath -Force
    }
    throw
} finally {
    Remove-Item -LiteralPath $releaseDir -Recurse -Force -ErrorAction SilentlyContinue
}

if (-not (Test-Path -LiteralPath $archivePath -PathType Leaf)) {
    throw "Plesk release ZIP was not created successfully."
}

Write-Output "Created Plesk static release: $archivePath ($($entries.Count) files)"
