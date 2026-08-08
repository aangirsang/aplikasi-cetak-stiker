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
                kategoriId = umkm.dataKategori.id,
                kategori = umkm.dataKategori.kategori,
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
                umkmId = stiker.dataUmkm.id,
                namaUsaha = stiker.dataUmkm.namaUsaha,
                namaPemilik = stiker.dataUmkm.namaPemilik,
                noTelpon = stiker.dataUmkm.noTelpon,
                whatsapp = stiker.dataUmkm.whatsapp!!,
                facebook = stiker.dataUmkm.facebook!!,
                instagram = stiker.dataUmkm.instagram!!,
                alamat = stiker.dataUmkm.alamat,
                kodeStiker = stiker.kodeStiker,
                namaStiker = stiker.namaStiker,
                panjang = stiker.panjang,
                lebar = stiker.lebar,
                ukuran = "${formatAngka(stiker.panjang)} X ${formatAngka(stiker.lebar)}",
                catatan = stiker.catatan,
                status = stiker.status,
                pathGambar1 = stiker.pathGambar1,
                pathGambar2 = stiker.pathGambar2,
                barangId = stiker.dataBarang.id,
                namaBarang = stiker.dataBarang.namaBarang,
                stokBarang = stiker.dataBarang.stokBarang,
                pathTIF = stiker.layoutCetak?.pathTIF ?: "",
                lebarKertas = stiker.layoutCetak?.lebarKertas ?: 0.0,
                tinggiKertas = stiker.layoutCetak?.tinggiKertas ?: 0.0,
                offsetX = stiker.layoutCetak?.offsetX ?: 0.0,
                offsetY = stiker.layoutCetak?.offsetY ?: 0.0,
                width = stiker.layoutCetak?.width ?: 0.0,
                height = stiker.layoutCetak?.height ?: 0.0,
                dpiX = stiker.layoutCetak?.dpiX ?: 0.0,
                dpiY = stiker.layoutCetak?.dpiY ?: 0.0,
                imageWidthMM = stiker.layoutCetak?.imageWidthMM ?: 0.0,
                imageHeightMM = stiker.layoutCetak?.imageHeightMM ?: 0.0,
                dibuatPada = stiker.layoutCetak?.dibuatPada ?: 0,
                diubahPada = stiker.layoutCetak?.diubahPada ?: 0
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