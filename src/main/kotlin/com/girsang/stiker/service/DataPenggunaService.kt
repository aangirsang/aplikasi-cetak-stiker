package com.girsang.stiker.service

import com.girsang.stiker.model.dto.DataPenggunaCreateRequest
import com.girsang.stiker.model.dto.DataPenggunaUpdateRequest
import com.girsang.stiker.model.entity.DataPengguna
import com.girsang.stiker.repository.DataLevelRepository
import com.girsang.stiker.repository.DataPenggunaRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.Optional


@Service
class DataPenggunaService(
    private val repo: DataPenggunaRepository,
    private val dataLevelRepo: DataLevelRepository,
    private val deletionService: EntityDeletionService,
    private val passwordEncoder: PasswordEncoder
) {

    fun semuaPengguna(): List<DataPengguna> = repo.findAll()
    fun cariID(id: Long): Optional<DataPengguna> = repo.findById(id)

    fun simpan(request: DataPenggunaCreateRequest): DataPengguna {
        if (repo.existsByNamaPengguna(request.namaPengguna)) {
            throw IllegalArgumentException("Nama pengguna sudah digunakan")
        }

        val level =
            dataLevelRepo.findById(
                request.dataLevel.id
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

        return repo.save(pengguna)
    }
    fun update(id: Long, request: DataPenggunaUpdateRequest): DataPengguna {

        val dataLama = repo.findById(id).orElseThrow {
            NoSuchElementException(
                "Data pengguna dengan id $id tidak ditemukan"
            )
        }

        // cek username duplicate
        val usernameDipakai =
            repo.existsByNamaPenggunaAndIdNot(
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
                request.dataLevel.id
            ).orElseThrow()

        dataLama.dataLevel = level

        // hanya update password jika diisi
        if(!request.kataSandi.isNullOrBlank()){
            dataLama.kataSandi =
                passwordEncoder.encode(
                    request.kataSandi
                )
        }

        return repo.save(dataLama)
    }
    fun hapus(id: Long){
        if( (!repo.existsById(id)))  throw NoSuchElementException("Data tidak ditemukan")
        deletionService.safeDelete(DataPengguna::class.java, id)
    }
    // 🔐 Fungsi Login
    fun login(
        namaPengguna: String,
        kataSandi: String
    ): DataPengguna? {

        val pengguna =
            repo.findByNamaPengguna(
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