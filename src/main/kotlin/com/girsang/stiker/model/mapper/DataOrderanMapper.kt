package com.girsang.stiker.model.mapper

import com.girsang.stiker.model.dto.response.DataOrderanResponse
import com.girsang.stiker.model.dto.response.DataOrderanRinciResponse
import com.girsang.stiker.model.entity.DataOrderan
import com.girsang.stiker.model.entity.DataOrderanRinci
import org.springframework.stereotype.Component
import kotlin.String

@Component
class DataOrderanMapper {

    fun toResponse(entity: DataOrderan): DataOrderanResponse {
        return DataOrderanResponse(
            id = entity.id,
            dataPenggunaId = entity.dataPengguna.id,
            namaPengguna = entity.dataPengguna.namaPengguna,
            dataUmkmId = entity.dataUMKM.id,
            namaUmkm = entity.dataUMKM.namaUsaha,
            namaPemilik = entity.dataUMKM.namaPemilik,
            instagram = entity.dataUMKM.instagram,
            noTelpon = entity.dataUMKM.noTelpon,
            alamat = entity.dataUMKM.alamat,
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
            namaPengguna = entity.dataOrderan.dataPengguna.namaPengguna,
            namaUmkm = entity.dataOrderan.dataUMKM.namaUsaha,
            faktur = entity.dataOrderan.faktur,
            tanggal = entity.dataOrderan.tanggal,
            stikerId = entity.dataStiker.id,
            kodeStiker = entity.dataStiker.kodeStiker,
            namaStiker = entity.dataStiker.namaStiker,
            panjang = entity.dataStiker.panjang,
            lebar = entity.dataStiker.lebar,
            status = entity.dataStiker.status,
            catatan = entity.dataStiker.catatan,
            ukuranStiker = "${formatAngka(entity.dataStiker.panjang)} X ${formatAngka(entity.dataStiker.lebar)}",
            pathGambar1 = entity.dataStiker.pathGambar1,
            pathGambar2 = entity.dataStiker.pathGambar2,
            jumlah = entity.jumlah,
            pathTIF = entity.dataStiker.layoutCetak?.pathTIF ?: ""
        )
    }
    private fun formatAngka(value: Double): String {
        return if (value % 1.0 == 0.0) {
            value.toInt().toString()
        } else {
            value.toString()
        }
    }
}