package com.girsang.stiker.model.mapper

import com.girsang.stiker.model.dto.response.PenyesuaianStokResponse
import com.girsang.stiker.model.dto.response.RiwayatStokResponse
import com.girsang.stiker.model.entity.DataPenyesuaianStok
import com.girsang.stiker.model.entity.DataRiwayatStok
import org.springframework.stereotype.Component

@Component
class DataBarangMapper {

    fun toResponse(entity: DataRiwayatStok): RiwayatStokResponse {
        return RiwayatStokResponse(
            id = entity.id,
            dataBarangId = entity.dataBarang.id,
            namaBarang = entity.dataBarang.namaBarang,
            tanggal = entity.tanggal,
            jenis = entity.jenis.toString(),
            referensiId = entity.referensiId,
            perubahan = entity.perubahan,
            saldoAwal = entity.saldoAwal,
            saldoAkhir = entity.saldoAkhir,
            dataPenggunaId = entity.dataPengguna.id,
            namaPengguna = entity.dataPengguna.namaPengguna,
            keterangan = entity.keterangan
        )
    }
    fun toResponse(entity: DataPenyesuaianStok): PenyesuaianStokResponse {
        return PenyesuaianStokResponse(
            id = entity.id,
            dataBarangId = entity.dataBarang.id,
            namaBarang = entity.dataBarang.namaBarang,
            dataBarang = entity.dataBarang,
            dataPenggunaId = entity.dataPengguna.id,
            namaPengguna = entity.dataPengguna.namaPengguna,
            tanggal = entity.tanggal,
            stokSistem = entity.stokSistem,
            stokFisik = entity.stokFisik,
            selisih = entity.selisih,
            pathGambar = entity.pathGambar,
            alasan = entity.alasan
        )
    }
}