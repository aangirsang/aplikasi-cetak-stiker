package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataRiwayatStok
import org.springframework.data.jpa.repository.JpaRepository

interface DataRiwayatStokRepository: JpaRepository<DataRiwayatStok, String> {
    fun findByDataBarangId(barangId: String): List<DataRiwayatStok>
    fun findAllByOrderByTanggalDesc(): List<DataRiwayatStok>
}