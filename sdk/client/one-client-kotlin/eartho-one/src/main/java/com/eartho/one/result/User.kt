package com.eartho.one.result

import java.io.Serializable
import java.util.*

/**
 * Class that holds the information of a user's profile in Eartho.
 * Used both in [com.eartho.one.management.UsersAPIClient] and [com.eartho.one.authentication.AuthenticationAPIClient].
 */
public class User(
    public val uid: String?,
    public val displayName: String?,
    public val photoURL: String?,
    public val email: String?,
    public val isEmailVerified: Boolean?,
    public val firstName: String?,
    public val familyName: String?,
    public val providerSource: String?,
    private val extraInfo: Map<String, Any>?,
) : Serializable {

    /**
     * Returns extra information of the profile that is not part of the normalized profile
     *
     * @return a map with user's extra information found in the profile
     */
    public fun getExtraInfo(): Map<String, Any> {
        return extraInfo?.toMap() ?: emptyMap()
    }

    override fun toString(): String {
        return "User(uid=$uid, displayName=$displayName, photoURL=$photoURL, email=$email, isEmailVerified=$isEmailVerified, firstName=$firstName, familyName=$familyName, providerSource=$providerSource, extraInfo=$extraInfo)"
    }


}