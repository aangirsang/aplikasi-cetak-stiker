package com.girsang.stiker.config

import com.girsang.stiker.service.DatabaseBackupService
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class StartupBackupListener(
    private val databaseBackupService: DatabaseBackupService
) {

    @EventListener(ApplicationReadyEvent::class)
    fun onApplicationReady() {
        databaseBackupService.backup()
    }
}