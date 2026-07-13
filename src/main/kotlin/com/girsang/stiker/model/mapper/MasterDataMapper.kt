package com.girsang.stiker.model.mapper

import com.girsang.stiker.model.dto.response.DataPenggunaResponse
import com.girsang.stiker.model.entity.DataPengguna
import org.springframework.stereotype.Component

@Component
class MasterDataMapper {

    fun toResponse(pengguna: DataPengguna): DataPenggunaResponse {
        return DataPenggunaResponse(
            id = pengguna.id,
            namaLengkap = pengguna.namaLengkap,
            namaPengguna = pengguna.namaPengguna,
            dataLevel = pengguna.dataLevel,
            status = pengguna.status,
            pathGambar = pengguna.pathGambar
        )
    }
}