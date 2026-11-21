package com.girsang.stiker.config

import org.hibernate.resource.jdbc.spi.StatementInspector
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.AnonymousAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder

class RingkasSqlInspector : StatementInspector {

    private val log = LoggerFactory.getLogger("DATA")
    private val pola = Regex("""(?:from|into|update)\s+(\w+)""")

    override fun inspect(sql: String): String {
        val s = sql.trimStart().lowercase()

        val aksi = when {
            s.startsWith("select") -> "Select"
            s.startsWith("insert") -> "Save"
            s.startsWith("update") -> "Update"
            s.startsWith("delete") -> "Delete"
            else -> return sql
        }

        val tabel = pola.find(s)?.groupValues?.get(1) ?: "-"
        log.info("[${namaPengguna()}] $aksi data: $tabel")

        return sql
    }

    private fun namaPengguna(): String {
        val auth = SecurityContextHolder.getContext().authentication
        return when {
            auth == null -> "sistem"
            auth is AnonymousAuthenticationToken -> "anonim"
            !auth.isAuthenticated -> "anonim"
            else -> auth.name
        }
    }
}