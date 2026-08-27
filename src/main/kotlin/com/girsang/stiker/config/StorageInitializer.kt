package com.girsang.stiker.config

import jakarta.annotation.PostConstruct
import org.springframework.stereotype.Component

@Component
class StorageInitializer(
    private val pathProvider: AppPathProvider
) {

    @PostConstruct
    fun init() {
        val databaseDir = pathProvider.databaseDir()
        val databaseFile = pathProvider.databaseFile()

        databaseDir.mkdirs()

        if (!databaseFile.exists()) {
            databaseFile.createNewFile()
        }
    }
}