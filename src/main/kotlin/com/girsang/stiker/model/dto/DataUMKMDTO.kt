package com.girsang.stiker.model.dto

import com.girsang.stiker.model.entity.DataKategori
import com.girsang.stiker.model.entity.DataUmkm
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank

data class DataUMKMDTO(
    val id: Long = 0,
    var namaUsaha: String,
    var namaPemilik: String,
    var dataKategori: DataKategori,
    var deskripsi: String? = "",
    var noKtp: String,
    var jenisKelamin: Boolean = true,
    var tglLahir: Long,
    var noTelpon: String,

    @field:Email(message = "Format email tidak valid")
    var email: String,

    @field:NotBlank(message = "Alamat tidak boleh kosong")
    var alamat: String,

    var whatsapp: String? = null,
    var instagram: String? = null,
    var facebook: String? = null,
    var tiktok: String? = null,
    var status: Boolean = true,
    var tglRegistrasi: Long
) {
    companion object {
        fun fromEntity(entity: DataUmkm): DataUMKMDTO {
            return DataUMKMDTO(
                id = entity.id,
                namaUsaha = entity.namaUsaha,
                namaPemilik = entity.namaPemilik,
                dataKategori = entity.dataKategori,
                deskripsi = entity.deskripsi,
                noKtp = entity.noKtp,
                jenisKelamin = entity.jenisKelamin,
                tglLahir = entity.tglLahir,
                noTelpon = entity.noTelpon,
                email = entity.email,
                alamat = entity.alamat,
                whatsapp = entity.whatsapp,
                instagram = entity.instagram,
                facebook = entity.facebook,
                tiktok = entity.tiktok,
                status = entity.status,
                tglRegistrasi = entity.tglRegistrasi
            )
        }
    }
}
