package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataBarang
import org.springframework.data.jpa.repository.JpaRepository

interface DataBarangRepository: JpaRepository<DataBarang, Long> {
    fun existsByNamaBarangIgnoreCase(namaBarang: String): Boolean
    fun existsByNamaBarangIgnoreCaseAndIdNot (namaBarang: String, id: Long): Boolean
}