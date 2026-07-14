package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataRiwayatStok
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DataRiwayatStokRepository: JpaRepository<DataRiwayatStok, String> {
    fun findByDataBarangId(barangId: String): List<DataRiwayatStok>
    fun findAllByOrderByTanggalDesc(): List<DataRiwayatStok>
}