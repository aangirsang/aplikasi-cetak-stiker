package com.girsang.stiker.service.orderan

import com.girsang.stiker.model.dto.response.DataOrderanRinciResponse
import com.girsang.stiker.model.dto.response.download.orderan.RekapOrderanBulananResponse
import com.girsang.stiker.model.dto.response.download.orderan.RekapStikerResponse
import com.girsang.stiker.model.dto.response.download.orderan.RekapUmkmResponse
import com.girsang.stiker.model.mapper.DataOrderanMapper
import com.girsang.stiker.repository.DataOrderanRepository
import com.girsang.stiker.repository.DataOrderanRinciRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.ZoneId

@Service
@Transactional(readOnly = true)
class LaporanOrderanService(

    private val repoOrderan: DataOrderanRepository,
    private val repoOrderanRinci: DataOrderanRinciRepository,
    private val mapper: DataOrderanMapper

) {

    fun getSemua(
        tanggalAwal: LocalDate?,
        tanggalAkhir: LocalDate?
    ): List<DataOrderanRinciResponse> {

        val awal = toStartMillis(tanggalAwal)
        val akhir = toEndMillis(tanggalAkhir)


        return repoOrderanRinci.findAllFilter(awal, akhir)
            .map { mapper.toResponse(it) }
    }

    fun getRekapUmkm(
        tanggalAwal: LocalDate?,
        tanggalAkhir: LocalDate?
    ): List<RekapUmkmResponse> {

        val awal = toStartMillis(tanggalAwal)
        val akhir = toEndMillis(tanggalAkhir)

        return repoOrderanRinci.rekapUmkm(awal, akhir)
    }

    fun getRekapStiker(
        tanggalAwal: LocalDate?,
        tanggalAkhir: LocalDate?
    ): List<RekapStikerResponse> {

        val awal = toStartMillis(tanggalAwal)
        val akhir = toEndMillis(tanggalAkhir)

        return repoOrderanRinci.rekapStiker(awal, akhir)
    }

    fun getRekapOrderanBulanan(
        tanggalAwal: LocalDate?,
        tanggalAkhir: LocalDate?
    ): List<RekapOrderanBulananResponse> {
        val awal = toStartMillis(tanggalAwal)
        val akhir = toEndMillis(tanggalAkhir)

        return repoOrderan.getRekapOrderanBulanan(awal, akhir)
    }

    private fun toStartMillis(date: LocalDate?): Long? =
        date?.atStartOfDay(ZoneId.systemDefault())
            ?.toInstant()
            ?.toEpochMilli()

    private fun toEndMillis(date: LocalDate?): Long? =
        date?.plusDays(1)
            ?.atStartOfDay(ZoneId.systemDefault())
            ?.minusNanos(1)
            ?.toInstant()
            ?.toEpochMilli()
}