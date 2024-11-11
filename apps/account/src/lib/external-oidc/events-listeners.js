import debug from 'debug';

const prefix = 'oidc-provider:events:';

/**
 * Subscribe to all oidc-provider events.
 */
export default function subscribe(provider) {
  const eventHandlers = [
    ['access_token.destroyed', onAccessTokenDestroyed],
    ['access_token.saved', onAccessTokenSaved],
    ['access_token.issued', onAccessTokenIssued],
    ['authorization_code.consumed', onAuthorizationCodeConsumed],
    ['authorization_code.destroyed', onAuthorizationCodeDestroyed],
    ['authorization_code.saved', onAuthorizationCodeSaved],
    ['authorization.accepted', onAuthorizationAccepted],
    ['authorization.error', onAuthorizationError],
    ['authorization.success', onAuthorizationSuccess],
    ['backchannel.error', onBackchannelError],
    ['backchannel.success', onBackchannelSuccess],
    ['jwks.error', onJwksError],
    ['client_credentials.destroyed', onClientCredentialsDestroyed],
    ['client_credentials.saved', onClientCredentialsSaved],
    ['client_credentials.issued', onClientCredentialsIssued],
    ['device_code.consumed', onDeviceCodeConsumed],
    ['device_code.destroyed', onDeviceCodeDestroyed],
    ['device_code.saved', onDeviceCodeSaved],
    ['discovery.error', onDiscoveryError],
    ['end_session.error', onEndSessionError],
    ['end_session.success', onEndSessionSuccess],
    ['grant.error', onGrantError],
    ['grant.revoked', onGrantRevoked],
    ['grant.success', onGrantSuccess],
    ['initial_access_token.destroyed', onInitialAccessTokenDestroyed],
    ['initial_access_token.saved', onInitialAccessTokenSaved],
    ['interaction.destroyed', onInteractionDestroyed],
    ['interaction.ended', onInteractionEnded],
    ['interaction.saved', onInteractionSaved],
    ['interaction.started', onInteractionStarted],
    ['introspection.error', onIntrospectionError],
    ['replay_detection.destroyed', onReplayDetectionDestroyed],
    ['replay_detection.saved', onReplayDetectionSaved],
    ['pushed_authorization_request.error', onPushedAuthorizationRequestError],
    ['pushed_authorization_request.success', onPushedAuthorizationRequestSuccess],
    ['pushed_authorization_request.destroyed', onPushedAuthorizationRequestDestroyed],
    ['pushed_authorization_request.saved', onPushedAuthorizationRequestSaved],
    ['refresh_token.consumed', onRefreshTokenConsumed],
    ['refresh_token.destroyed', onRefreshTokenDestroyed],
    ['refresh_token.saved', onRefreshTokenSaved],
    ['registration_access_token.destroyed', onRegistrationAccessTokenDestroyed],
    ['registration_access_token.saved', onRegistrationAccessTokenSaved],
    ['registration_create.error', onRegistrationCreateError],
    ['registration_create.success', onRegistrationCreateSuccess],
    ['registration_delete.error', onRegistrationDeleteError],
    ['registration_delete.success', onRegistrationDeleteSuccess],
    ['registration_read.error', onRegistrationReadError],
    ['registration_update.error', onRegistrationUpdateError],
    ['registration_update.success', onRegistrationUpdateSuccess],
    ['revocation.error', onRevocationError],
    ['server_error', onServerError],
    ['session.destroyed', onSessionDestroyed],
    ['session.saved', onSessionSaved],
    ['userinfo.error', onUserinfoError],
  ];

  eventHandlers.forEach(([eventName, listener]) => {
    const eventDebug = debug(`${prefix}${eventName}`);
    provider.on(eventName, (...args) => {
      // Filter out the request context if present to prevent log bloat
      eventDebug(`Event triggered: ${eventName}`, ...args.filter(arg => !arg.req));
      // Call the specific event listener for handling
      listener(eventName, ...args);
    });
  });
}

/**
 * Helper function to log events with event-specific data.
 */
function logEvent(eventName, ...args) {
  console.log(`Event: ${eventName}`, ...args);
}

/**
 * Define each event handler function with logging.
 */
function onAccessTokenDestroyed(...args) {
  logEvent('access_token.destroyed', ...args);
}

function onAccessTokenSaved(...args) {
  logEvent('access_token.saved', ...args);
}

function onAccessTokenIssued(...args) {
  logEvent('access_token.issued', ...args);
}

function onAuthorizationCodeConsumed(...args) {
  logEvent('authorization_code.consumed', ...args);
}

function onAuthorizationCodeDestroyed(...args) {
  logEvent('authorization_code.destroyed', ...args);
}

function onAuthorizationCodeSaved(...args) {
  logEvent('authorization_code.saved', ...args);
}

function onAuthorizationAccepted(...args) {
  logEvent('authorization.accepted', ...args);
}

function onAuthorizationError(...args) {
  logEvent('authorization.error', ...args);
}

function onAuthorizationSuccess(...args) {
  logEvent('authorization.success', ...args);
}

function onBackchannelError(...args) {
  logEvent('backchannel.error', ...args);
}

function onBackchannelSuccess(...args) {
  logEvent('backchannel.success', ...args);
}

function onJwksError(...args) {
  logEvent('jwks.error', ...args);
}

function onClientCredentialsDestroyed(...args) {
  logEvent('client_credentials.destroyed', ...args);
}

function onClientCredentialsSaved(...args) {
  logEvent('client_credentials.saved', ...args);
}

function onClientCredentialsIssued(...args) {
  logEvent('client_credentials.issued', ...args);
}

function onDeviceCodeConsumed(...args) {
  logEvent('device_code.consumed', ...args);
}

function onDeviceCodeDestroyed(...args) {
  logEvent('device_code.destroyed', ...args);
}

function onDeviceCodeSaved(...args) {
  logEvent('device_code.saved', ...args);
}

function onDiscoveryError(...args) {
  logEvent('discovery.error', ...args);
}

function onEndSessionError(...args) {
  logEvent('end_session.error', ...args);
}

function onEndSessionSuccess(...args) {
  logEvent('end_session.success', ...args);
}

function onGrantError(...args) {
  logEvent('grant.error', ...args);
}

function onGrantRevoked(...args) {
  logEvent('grant.revoked', ...args);
}

function onGrantSuccess(...args) {
  logEvent('grant.success', ...args);
}

function onInitialAccessTokenDestroyed(...args) {
  logEvent('initial_access_token.destroyed', ...args);
}

function onInitialAccessTokenSaved(...args) {
  logEvent('initial_access_token.saved', ...args);
}

function onInteractionDestroyed(...args) {
  logEvent('interaction.destroyed', ...args);
}

function onInteractionEnded(...args) {
  logEvent('interaction.ended', ...args);
}

function onInteractionSaved(...args) {
  logEvent('interaction.saved', ...args);
}

function onInteractionStarted(...args) {
  logEvent('interaction.started', ...args);
}

function onIntrospectionError(...args) {
  logEvent('introspection.error', ...args);
}

function onReplayDetectionDestroyed(...args) {
  logEvent('replay_detection.destroyed', ...args);
}

function onReplayDetectionSaved(...args) {
  logEvent('replay_detection.saved', ...args);
}

function onPushedAuthorizationRequestError(...args) {
  logEvent('pushed_authorization_request.error', ...args);
}

function onPushedAuthorizationRequestSuccess(...args) {
  logEvent('pushed_authorization_request.success', ...args);
}

function onPushedAuthorizationRequestDestroyed(...args) {
  logEvent('pushed_authorization_request.destroyed', ...args);
}

function onPushedAuthorizationRequestSaved(...args) {
  logEvent('pushed_authorization_request.saved', ...args);
}

function onRefreshTokenConsumed(...args) {
  logEvent('refresh_token.consumed', ...args);
}

function onRefreshTokenDestroyed(...args) {
  logEvent('refresh_token.destroyed', ...args);
}

function onRefreshTokenSaved(...args) {
  logEvent('refresh_token.saved', ...args);
}

function onRegistrationAccessTokenDestroyed(...args) {
  logEvent('registration_access_token.destroyed', ...args);
}

function onRegistrationAccessTokenSaved(...args) {
  logEvent('registration_access_token.saved', ...args);
}

function onRegistrationCreateError(...args) {
  logEvent('registration_create.error', ...args);
}

function onRegistrationCreateSuccess(...args) {
  logEvent('registration_create.success', ...args);
}

function onRegistrationDeleteError(...args) {
  logEvent('registration_delete.error', ...args);
}

function onRegistrationDeleteSuccess(...args) {
  logEvent('registration_delete.success', ...args);
}

function onRegistrationReadError(...args) {
  logEvent('registration_read.error', ...args);
}

function onRegistrationUpdateError(...args) {
  logEvent('registration_update.error', ...args);
}

function onRegistrationUpdateSuccess(...args) {
  logEvent('registration_update.success', ...args);
}

function onRevocationError(...args) {
  logEvent('revocation.error', ...args);
}

function onServerError(...args) {
  logEvent('server_error', ...args);
}

function onSessionDestroyed(...args) {
  logEvent('session.destroyed', ...args);
}

function onSessionSaved(...args) {
  logEvent('session.saved', ...args);
}

function onUserinfoError(...args) {
  logEvent('userinfo.error', ...args);
}
