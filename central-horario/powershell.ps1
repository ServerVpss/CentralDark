$script:CentralDarkBrasiliaTimeZoneId = if ($IsWindows -or $env:OS -eq 'Windows_NT') { 'E. South America Standard Time' } else { 'America/Sao_Paulo' }

function Get-CentralDarkBrasiliaNow {
  $tz = [System.TimeZoneInfo]::FindSystemTimeZoneById($script:CentralDarkBrasiliaTimeZoneId)
  return [System.TimeZoneInfo]::ConvertTime([DateTimeOffset]::UtcNow, $tz)
}

function Format-CentralDarkBrasiliaTime {
  param([DateTimeOffset]$Value = [DateTimeOffset]::UtcNow)
  $tz = [System.TimeZoneInfo]::FindSystemTimeZoneById($script:CentralDarkBrasiliaTimeZoneId)
  $local = [System.TimeZoneInfo]::ConvertTime($Value, $tz)
  return ($local.ToString('dd/MM/yyyy HH:mm:ss') + ' BRT')
}

function Get-CentralDarkUtcIso {
  return [DateTimeOffset]::UtcNow.ToString('o')
}
