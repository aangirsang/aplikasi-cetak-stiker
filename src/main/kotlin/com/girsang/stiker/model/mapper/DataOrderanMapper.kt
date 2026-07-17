package com.girsang.stiker.model.mapper

import com.girsang.stiker.model.dto.response.DataOrderanResponse
import com.girsang.stiker.model.dto.response.DataOrderanRinciResponse
import com.girsang.stiker.model.entity.DataOrderan
import com.girsang.stiker.model.entity.DataOrderanRinci
import org.springframework.stereotype.Component

@Component
class DataOrderanMapper {

    fun toResponse(entity: DataOrderan): DataOrderanResponse {
        return DataOrderanResponse(
            id = entity.id,
            dataPenggunaId = entity.dataPengguna.id,
            namaPengguna = entity.dataPengguna.namaPengguna,
            dataUmkmId = entity.dataUMKM.id,
            namaUmkm = entity.dataUMKM.namaUsaha,
            tanggal = entity.tanggal,
            faktur = entity.faktur,
            totalStiker = entity.totalStiker,
            rincian = entity.rincian.map {
                toResponse(it)
            }
        )
    }

    fun toResponse(entity: DataOrderanRinci): DataOrderanRinciResponse {
        return DataOrderanRinciResponse(
            id = entity.id,
            dataOrderanId = entity.dataOrderan.id,
            stiketId = entity.dataStiker.id,
            kodeStiker = entity.dataStiker.kodeStiker,
            namaStiker = entity.dataStiker.namaStiker,
            ukuranStiker = "${entity.dataStiker.panjang} X ${entity.dataStiker.lebar}",
            jumlah = entity.jumlah
        )
    }
}