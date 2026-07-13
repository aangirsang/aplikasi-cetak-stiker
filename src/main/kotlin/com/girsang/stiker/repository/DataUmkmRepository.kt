package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataUmkm
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface DataUmkmRepository: JpaRepository<DataUmkm, String> {
    fun existsByEmail(email: String): Boolean
    fun existsByNoKtp(noKTP: String): Boolean

    @Query("""
        SELECT U
        FROM DataUmkm U
        WHERE (:namaPemilikUmkm IS NULL OR LOWER(U.namaPemilik) LIKE LOWER(CONCAT('%', :namaPemilikUmkm, '%')))
        AND (:namaUmkm IS NULL OR LOWER(U.namaUsaha) LIKE LOWER(CONCAT('%', :namaUmkm, '%')))
        AND (:alamat IS NULL OR LOWER(U.alamat) LIKE LOWER(CONCAT('%', :alamat, '%')))
    """)
    fun cariUMKM(
        @Param("namaPemilikUmkm") namaPemilikUMKM: String?,
        @Param("namaUmkm") namaUMKM: String?,
        @Param("alamat") alamat: String?
    ): List<DataUmkm>

    @Query("""
        SELECT DISTINCT u
        FROM DataUmkm u
        JOIN u.daftarStiker s
        WHERE u.status = true
    """)
    fun findUmkmWithStiker(): List<DataUmkm>

    fun findAllByStatusTrue(): List<DataUmkm>

}