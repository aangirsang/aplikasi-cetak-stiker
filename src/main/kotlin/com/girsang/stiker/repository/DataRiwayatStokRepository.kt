package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataRiwayatStok
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DataRiwayatStokRepository: JpaRepository<DataRiwayatStok, String> {
    fun findByDataBarangId(barangId: String): List<DataRiwayatStok>
    fun findAllByOrderByTanggalDesc(): List<DataRiwayatStok>

    @Query("""
        SELECT r
        FROM DataRiwayatStok r
        WHERE r.tanggal = (
            SELECT MAX(r2.tanggal)
            FROM DataRiwayatStok r2
            WHERE r2.referensiId = r.referensiId
        )
        ORDER BY r.tanggal DESC
    """)
    fun findRiwayatTerakhir(): List<DataRiwayatStok>
}