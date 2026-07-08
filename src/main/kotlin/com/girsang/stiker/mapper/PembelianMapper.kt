package com.girsang.stiker.mapper

import com.girsang.stiker.model.dto.response.PembelianResponse
import com.girsang.stiker.model.dto.response.PembelianRinciResponse
import com.girsang.stiker.model.entity.DataPembelian
import com.girsang.stiker.model.entity.DataPembelianRinci
import org.springframework.stereotype.Component

@Component
class PembelianMapper {

    fun toResponse(entity: DataPembelian): PembelianResponse {
        return PembelianResponse(
            id = entity.id,
            dataPenggunaId = entity.dataPengguna.id,
            namaPengguna = entity.dataPengguna.namaPengguna,
            tanggal = entity.tanggal,
            subtotal = entity.subtotal,
            rincian = entity.rincian.map {
                toResponse(it)
            }
        )
    }

    fun toResponse(entity: DataPembelianRinci): PembelianRinciResponse {

        return PembelianRinciResponse(
            id = entity.id,
            dataBarangId = entity.dataBarang.id,
            tanggal = entity.dataPembelian.tanggal,
            namaBarang = entity.dataBarang.namaBarang,
            harga = entity.harga,
            jumlah = entity.jumlah,
            total = entity.total
        )
    }

}