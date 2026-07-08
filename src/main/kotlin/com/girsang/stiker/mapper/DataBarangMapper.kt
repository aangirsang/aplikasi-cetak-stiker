package com.girsang.stiker.mapper

import com.girsang.stiker.model.dto.response.RiwayatStokResponse
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
}