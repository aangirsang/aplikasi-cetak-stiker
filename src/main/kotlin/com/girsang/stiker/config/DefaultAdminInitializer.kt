package com.girsang.stiker.config

import com.girsang.stiker.model.entity.DataLevel
import com.girsang.stiker.model.entity.DataPengguna
import com.girsang.stiker.repository.DataLevelRepository
import com.girsang.stiker.repository.DataPenggunaRepository
import jakarta.annotation.PostConstruct
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

@Component
class DefaultAdminInitializer(
    private val levelRepo: DataLevelRepository,
    private val penggunaRepo: DataPenggunaRepository,
    private val passwordEncoder: PasswordEncoder
) {

    @PostConstruct
    fun init() {

        if (
            levelRepo.count() == 0L &&
            penggunaRepo.count() == 0L
        ) {

            val adminLevel =
                levelRepo.save(
                    DataLevel(
                        level = "ADMIN"
                    )
                )

            penggunaRepo.save(
                DataPengguna(
                    namaLengkap = "Administrator",
                    namaPengguna = "admin",
                    kataSandi =
                        passwordEncoder.encode(
                            "admin123"
                        ),
                    status = true,
                    pathGambar = "",
                    dataLevel = adminLevel
                )
            )

            println(
                "ADMIN DEFAULT BERHASIL DIBUAT"
            )
        }
    }
}