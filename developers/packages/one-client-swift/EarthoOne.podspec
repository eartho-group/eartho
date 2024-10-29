# Define base paths for source files
base_path = 'developers/packages/one-client-swift/EarthoOne/'
web_auth_files = [
  'Array+Encode.swift',
  'ASProvider.swift',
  'AuthTransaction.swift',
  'EarthoOneWebAuth.swift',
  'BioAuthentication.swift',
  'ChallengeGenerator.swift',
  'ClaimValidators.swift',
  'ClearSessionTransaction.swift',
  'IDTokenSignatureValidator.swift',
  'IDTokenValidator.swift',
  'IDTokenValidatorContext.swift',
  'JWK+RSA.swift',
  'JWT+Header.swift',
  'JWTAlgorithm.swift',
  'LoginTransaction.swift',
  'NSURLComponents+OAuth2.swift',
  'OAuth2Grant.swift',
  'SafariProvider.swift',
  'TransactionStore.swift',
  'WebAuth.swift',
  'WebAuthentication.swift',
  'WebAuthError.swift',
  'WebAuthUserAgent.swift'
].map { |file| base_path + file }  # Prepend base path to each file

ios_files = [base_path + 'MobileWebAuth.swift']
macos_files = [base_path + 'DesktopWebAuth.swift']
excluded_files = web_auth_files + ios_files + macos_files

# Podspec configuration
Pod::Spec.new do |s|
  s.name             = 'EarthoOne'
  s.version          = '1.1.0'
  s.summary          = "EarthoOne SDK for Apple platforms"
  s.description      = <<-DESC
                        EarthoOne SDK for iOS, macOS, tvOS, and watchOS apps.
                        DESC
  s.homepage         = 'https://github.com/earthodev/eartho'
  s.license          = 'Mozilla Public License Version 2.0'
  s.authors          = { 'Eartho' => 'contact@eartho.io' }
  s.source           = { :git => 'https://github.com/earthodev/eartho.git', :tag => s.version.to_s }
  s.social_media_url = 'https://twitter.com/eartho'
  s.source_files     = web_auth_files + ios_files + macos_files
  s.swift_version = '5.3'

  s.dependency 'SimpleKeychain', '~> 0.12'
  s.dependency 'JWTDecode', '~> 2.0'

  # iOS-specific configuration
  s.ios.deployment_target   = '15.0'
  s.ios.exclude_files       = macos_files
  s.ios.source_files        = ios_files + web_auth_files
  s.ios.pod_target_xcconfig = { 'SWIFT_ACTIVE_COMPILATION_CONDITIONS' => 'WEB_AUTH_PLATFORM' }

  # macOS-specific configuration
  s.osx.deployment_target   = '15.0'
  s.osx.exclude_files       = ios_files
  s.osx.source_files        = macos_files + web_auth_files
  s.osx.pod_target_xcconfig = { 'SWIFT_ACTIVE_COMPILATION_CONDITIONS' => 'WEB_AUTH_PLATFORM' }
end
