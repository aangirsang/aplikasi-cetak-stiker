package com.girsang.stiker.repository

import com.girsang.stiker.model.dto.response.DataOrderanRinciResponse
import com.girsang.stiker.model.dto.response.download.orderan.RekapStikerResponse
import com.girsang.stiker.model.dto.response.download.orderan.RekapUmkmResponse
import com.girsang.stiker.model.entity.DataOrderanRinci
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate

interface DataOrderanRinciRepository: JpaRepository<DataOrderanRinci, String> {
    @Query("""
        SELECT r
        FROM DataOrderanRinci r
        JOIN FETCH r.dataOrderan o
        JOIN FETCH o.dataPengguna
        JOIN FETCH o.dataUMKM
        JOIN FETCH r.dataStiker
        WHERE
        (:awal IS NULL OR o.tanggal >= :awal)
        AND
        (:akhir IS NULL OR o.tanggal <= :akhir)
        ORDER BY o.tanggal DESC
        """)
    fun findAllFilter(
        awal: Long?,
        akhir: Long?
    ): List<DataOrderanRinci>

    @Query("""
        SELECT new com.girsang.stiker.model.dto.response.download.orderan.RekapUmkmResponse(
            r.dataOrderan.dataUMKM.id,
            r.dataOrderan.dataUMKM.namaUsaha,
            SUM(r.jumlah)
        )
        FROM DataOrderanRinci r
        WHERE
            (:awal IS NULL OR r.dataOrderan.tanggal >= :awal)
        AND 
            (:akhir IS NULL OR r.dataOrderan.tanggal <= :akhir)
        GROUP BY
            r.dataOrderan.dataUMKM.id,
            r.dataOrderan.dataUMKM.namaUsaha
        ORDER BY
            r.dataOrderan.dataUMKM.namaUsaha
        """)
    fun rekapUmkm(
        awal: Long?,
        akhir: Long?
    ): List<RekapUmkmResponse>

    @Query("""
        SELECT new com.girsang.stiker.model.dto.response.download.orderan.RekapStikerResponse(
            r.dataStiker.id,
            r.dataStiker.dataUmkm.namaUsaha,
            r.dataStiker.kodeStiker,
            r.dataStiker.namaStiker,
            r.dataStiker.panjang,
            r.dataStiker.lebar,
            SUM(r.jumlah)
        )
        FROM DataOrderanRinci r
        WHERE
            (:awal IS NULL OR r.dataOrderan.tanggal >= :awal)
        AND
            (:akhir IS NULL OR r.dataOrderan.tanggal <= :akhir)
        GROUP BY
            r.dataStiker.id,
            r.dataStiker.dataUmkm.namaUsaha,
            r.dataStiker.kodeStiker,
            r.dataStiker.namaStiker,
            r.dataStiker.panjang,
            r.dataStiker.lebar
        ORDER BY
            LOWER(r.dataStiker.dataUmkm.namaUsaha),
            LOWER(r.dataStiker.namaStiker)
    """)
    fun rekapStiker(
        awal: Long?,
        akhir: Long?
    ): List<RekapStikerResponse>
}
