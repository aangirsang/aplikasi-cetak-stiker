package com.girsang.stiker.model.dto

import com.girsang.stiker.model.entity.DataStiker
import com.girsang.stiker.model.entity.DataUmkm


data class DataStikerDTO(
    val id: Long = 0,
    var dataUmkm: DataUmkm,
    var umkmId: Long,
    var kodeStiker: String = "",
    var namaStiker: String = "",
    var panjang: Int = 0,
    var lebar: Int = 0,
    var ukuran: String = "",
    var catatan: String? = "",
    var status: Boolean = true,
    var pathGambar1: String = "",
    var pathGambar2: String = ""
) {
    companion object {
        fun fromEntity(entity: DataStiker): DataStikerDTO {
            return DataStikerDTO(
                id = entity.id,
                dataUmkm = entity.dataUmkm,
                umkmId = entity.dataUmkm.id,
                kodeStiker = entity.kodeStiker,
                namaStiker = entity.namaStiker,
                panjang = entity.panjang,
                lebar = entity.lebar,
                ukuran = "${entity.panjang} X ${entity.lebar}",
                catatan = entity.catatan,
                status = entity.status,
                pathGambar1 = entity.pathGambar1,
                pathGambar2 = entity.pathGambar2
            )
        }
    }
}

data class SaveDataStikerRequest(
    var umkmId: Long,
    var namaStiker: String,
    var panjang: Int,
    var lebar: Int,
    var catatan: String?,
    var status: Boolean,
    var pathGambar1: String = "",
    var pathGambar2: String = ""
)
