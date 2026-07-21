package com.girsang.stiker.model.mapper

import com.girsang.stiker.model.dto.response.DataStikerResponse
import com.girsang.stiker.model.dto.response.DataUmkmResponse
import com.girsang.stiker.model.entity.DataStiker
import com.girsang.stiker.model.entity.DataUmkm
import org.springframework.stereotype.Component

@Component
class DataUmkmMapper {

    fun toResponse(umkm: DataUmkm): DataUmkmResponse {
        return DataUmkmResponse(
            id = umkm.id,
            namaUsaha = umkm.namaUsaha,
            namaPemilik = umkm.namaPemilik,
            dataKategoriId = umkm.dataKategori.id,
            dataKategori = umkm.dataKategori,
            deskripsi = umkm.deskripsi,
            noKtp = umkm.noKtp,
            jenisKelamin = umkm.jenisKelamin,
            tglLahir = umkm.tglLahir,
            noTelpon = umkm.noTelpon,
            email = umkm.email,
            alamat = umkm.alamat,
            whatsapp = umkm.whatsapp,
            instagram = umkm.instagram,
            facebook = umkm.facebook,
            tiktok = umkm.tiktok,
            status = umkm.status,
            tglRegistrasi = umkm.tglRegistrasi
        )
    }

    fun toResponse(stiker: DataStiker): DataStikerResponse {
        return DataStikerResponse(
            id = stiker.id,
            dataUmkm = stiker.dataUmkm,
            umkmId = stiker.dataUmkm.id,
            kodeStiker = stiker.kodeStiker,
            namaStiker = stiker.namaStiker,
            panjang = stiker.panjang,
            lebar = stiker.lebar,
            ukuran = "${stiker.panjang} X ${stiker.lebar}",
            catatan = stiker.catatan,
            status = stiker.status,
            pathGambar1 = stiker.pathGambar1,
            pathGambar2 = stiker.pathGambar2,
            dataBarang = stiker.dataBarang,
            pathCDR = stiker.pathCDR
        )
    }
}