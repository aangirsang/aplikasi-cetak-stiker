package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataPengguna
import org.springframework.data.jpa.repository.JpaRepository

interface DataPenggunaRepository: JpaRepository<DataPengguna, String> {
    fun findByNamaPengguna(namaPengguna: String): DataPengguna?
    fun existsByNamaPengguna(namaPengguna: String): Boolean
    fun existsByNamaPenggunaAndIdNot(namaPengguna: String, id: String): Boolean
}