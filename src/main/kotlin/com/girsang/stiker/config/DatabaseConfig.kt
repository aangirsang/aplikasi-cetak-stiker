package com.girsang.stiker.config

import com.zaxxer.hikari.HikariDataSource
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.io.File
import javax.sql.DataSource

@Configuration
class DatabaseConfig(

    @Value("\${app.data.dir}")
    private val dataDir: String

) {

    @Bean
    fun dataSource(): DataSource {

        val dbDir = File(dataDir, "database")
        dbDir.mkdirs()

        val dbFile = File(dbDir, "cetak-stiker.db")

        if (!dbFile.exists()) {
            dbFile.createNewFile()
        }

        val ds = HikariDataSource()

        ds.jdbcUrl =
            "jdbc:sqlite:${dbFile.absolutePath}"

        ds.driverClassName =
            "org.sqlite.JDBC"

        return ds
    }
}