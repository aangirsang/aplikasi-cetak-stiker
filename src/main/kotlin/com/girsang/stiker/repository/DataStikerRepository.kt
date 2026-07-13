package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataStiker
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface DataStikerRepository: JpaRepository <DataStiker, String> {

    // 🔍 Cari stiker terakhir berdasarkan tahun (2 digit)
    @Query("""
        SELECT s FROM DataStiker s
        WHERE s.kodeStiker LIKE %:tahun%
        ORDER BY s.id DESC
    """)
    fun findLastKodeByYear(tahun: String): List<DataStiker>

    fun findByDataUmkmId(umkmId: String): List<DataStiker>

    @Query("""
        SELECT s
        FROM DataStiker s
        WHERE (:namaStiker IS NULL OR LOWER(s.namaStiker) LIKE LOWER(CONCAT('%', :namaStiker, '%')))
        AND (:namaUsaha IS NULL OR LOWER(s.dataUmkm.namaUsaha) LIKE LOWER(CONCAT('%', :namaUsaha, '%')))
        """)
    fun cariStiker(
        @Param("namaStiker") namaStiker: String?,
        @Param("namaUsaha") namaUsaha: String?
    ): List<DataStiker>

    @Query("""
    SELECT s FROM DataStiker s 
    WHERE s.dataUmkm.namaUsaha = :nama 
      AND SUBSTRING(s.kodeStiker, LENGTH(s.kodeStiker) - 3, 2) = :tahun 
    ORDER BY s.kodeStiker DESC
    """)
    fun findLastKodeByUmkmAndYear(
        @Param("nama") nama: String,
        @Param("tahun") tahun: String
    ): List<DataStiker>

    @Query("SELECT s FROM DataStiker s WHERE s.dataUmkm.id = :umkmId AND s.status = true ORDER BY s.namaStiker ASC")
    fun findByUmkmIdAndStatusTrue(@Param("umkmId") umkmId: String): List<DataStiker>
}