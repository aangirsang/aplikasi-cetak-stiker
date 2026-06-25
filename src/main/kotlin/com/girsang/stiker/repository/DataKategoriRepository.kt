package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataKategori
import org.springframework.data.jpa.repository.JpaRepository

interface DataKategoriRepository: JpaRepository<DataKategori, Long> {
    fun existsByKategoriIgnoreCase(kategori: String): Boolean
    fun existsByKategoriIgnoreCaseAndIdNot(kategori: String, id: Long): Boolean
}