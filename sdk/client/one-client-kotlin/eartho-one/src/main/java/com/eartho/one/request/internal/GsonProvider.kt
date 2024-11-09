package com.eartho.one.request.internal

import androidx.annotation.VisibleForTesting
import com.eartho.one.result.Credentials
import com.eartho.one.result.User
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.reflect.TypeToken
import java.lang.reflect.Type
import java.security.PublicKey
import java.text.SimpleDateFormat
import java.util.*


internal object GsonProvider {
    internal val gson: Gson
    private var sdf: SimpleDateFormat
    private const val DATE_FORMAT = "yyyy-MM-DD HH:mm:ss.S"

    init {

        val dateDeserializer =
            JsonDeserializer { json: JsonElement?, type: Type?, context: JsonDeserializationContext? ->
                if (json == null) null else Date(
                    json.asLong
                )
            }
        val jwksType = TypeToken.getParameterized(
            Map::class.java,
            String::class.java,
            PublicKey::class.java
        ).type
        gson = GsonBuilder()
            .registerTypeAdapterFactory(JsonRequiredTypeAdapterFactory())
            .registerTypeAdapter(User::class.java,
                UserProfileDeserializer()
            )
            .registerTypeAdapter(Credentials::class.java, CredentialsDeserializer())
            .registerTypeAdapter(jwksType, JwksDeserializer())
            .registerTypeAdapter(Date::class.java, dateDeserializer)
            .create()
        sdf = SimpleDateFormat(DATE_FORMAT, Locale.US)
    }

    @JvmStatic
    @VisibleForTesting
    fun formatDate(date: Date): String {
        return sdf.format(date)
    }
}

