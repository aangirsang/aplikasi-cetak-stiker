package com.girsang.stiker.service

import com.girsang.stiker.model.mapper.MasterDataMapper
import com.girsang.stiker.model.dto.request.DataPenggunaRequest
import com.girsang.stiker.model.dto.response.DataPenggunaResponse
import com.girsang.stiker.model.entity.DataPengguna
import com.girsang.stiker.repository.DataLevelRepository
import com.girsang.stiker.repository.DataPenggunaRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service


@Service
class DataPenggunaService(
    private val repoPengguna: DataPenggunaRepository,
    private val mapper: MasterDataMapper,
    private val dataLevelRepo: DataLevelRepository,
    private val deletionService: EntityDeletionService,
    private val passwordEncoder: PasswordEncoder
) {

    fun semuaPengguna(): List<DataPenggunaResponse> =
        repoPengguna.findAll().map { mapper.toResponse(it) }

    fun cariID(id: String): DataPenggunaResponse {
        val pengguna = repoPengguna.findById(id).orElseThrow {IllegalArgumentException("Pengguna tidak ditemukan")}
        return mapper.toResponse(pengguna)
    }

    fun simpan(request: DataPenggunaRequest): DataPenggunaResponse {
        if (repoPengguna.existsByNamaPengguna(request.namaPengguna)) {
            throw IllegalArgumentException("Nama pengguna sudah digunakan")
        }

        val level =
            dataLevelRepo.findById(
                request.dataLevelId
            ).orElseThrow()

        val pengguna =
            DataPengguna(
                namaLengkap = request.namaLengkap,
                namaPengguna = request.namaPengguna,
                kataSandi = passwordEncoder.encode( request.kataSandi),
                status = request.status,
                pathGambar = request.pathGambar,
                dataLevel = level
            )

        val simpan = repoPengguna.save(pengguna)

        return mapper.toResponse(simpan)
    }
    fun update(id: String, request: DataPenggunaRequest): DataPenggunaResponse {

        val dataLama = repoPengguna.findById(id).orElseThrow {
            NoSuchElementException(
                "Data pengguna dengan id $id tidak ditemukan"
            )
        }

        // cek username duplicate
        val usernameDipakai =
            repoPengguna.existsByNamaPenggunaAndIdNot(
                request.namaPengguna,
                id
            )

        if (usernameDipakai) {
            throw IllegalArgumentException(
                "Nama pengguna sudah digunakan"
            )
        }

        dataLama.namaLengkap =
            request.namaLengkap

        dataLama.namaPengguna =
            request.namaPengguna

        dataLama.status =
            request.status

        dataLama.pathGambar =
            request.pathGambar

        val level =
            dataLevelRepo.findById(
                request.dataLevelId
            ).orElseThrow()

        dataLama.dataLevel = level

        // hanya update password jika diisi
        if(!request.kataSandi.isNullOrBlank()){
            dataLama.kataSandi =
                passwordEncoder.encode(
                    request.kataSandi
                )
        }

        val simpan = repoPengguna.save(dataLama)
        return mapper.toResponse(simpan)
    }
    fun hapus(id: String){
        if( (!repoPengguna.existsById(id)))  throw NoSuchElementException("Data tidak ditemukan")
        deletionService.safeDelete(DataPengguna::class.java, id)
    }
    // 🔐 Fungsi Login
    fun login(
        namaPengguna: String,
        kataSandi: String
    ): DataPengguna? {

        val pengguna =
            repoPengguna.findByNamaPengguna(
                namaPengguna
            ) ?: return null

        if (!pengguna.status) {
            return null
        }

        if (
            !passwordEncoder.matches(
                kataSandi,
                pengguna.kataSandi
            )
        ) {
            return null
        }

        return pengguna
    }
}