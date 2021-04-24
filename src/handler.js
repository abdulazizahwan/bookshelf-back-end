const {
    nanoid,
} = require('nanoid');
const books = require('./books');

// Kriteria 1 : API dapat menyimpan buku
const addBookHandler = (request, h) => {
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;

    if (!name) {
        /*
        Client tidak melampirkan properti namepada request body.
        Bila hal ini terjadi, maka server akan merespons dengan
        */
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku'
        }).code(400);
        return response;
    }

    if (readPage > pageCount) {
        /*
        Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount.
        Bila hal ini terjadi, maka server akan merespons dengan
        */
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
        }).code(400);
        return response;
    }

    const id = nanoid(16);
    const finished = pageCount === readPage;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const newBook = {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        id,
        finished,
        insertedAt,
        updatedAt,
    };

    books.push(newBook);

    const isSuccess = books.filter((book) => book.id === id).length > 0;

    // Bila buku berhasil dimasukkan, server harus mengembalikan respons dengan:
    if (isSuccess) {
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            },
        }).code(201);
        return response;
    }

    // Server gagal memasukkan buku karena alasan umum (generic error).
    // Bila hal ini terjadi, maka server akan merespons dengan
    const response = h.response({
        status: 'fail',
        message: 'Buku gagal ditambahkan',
    }).code(500);
    return response;
};

// Kriteria 2 : API dapat menampilkan seluruh buku
const getAllBooksHandler = (request, h) => {
    const {
        name,
        reading,
        finished
    } = request.query;

    if (!name && !reading && !finished) {
        // Jika tidak ada query
        const response = h
            .response({
                status: 'success',
                data: {
                    books: books.map((book) => ({
                        id: book.id,
                        name: book.name,
                        publisher: book.publisher,
                    })),
                },
            })
            .code(200);

        return response;
    }

    if (name) {
        const filteredBooksName = books.filter((book) => {
            // Jika ada query name
            const nameRegex = new RegExp(name, 'gi');
            return nameRegex.test(book.name);
        });

        const response = h
            .response({
                status: 'success',
                data: {
                    books: filteredBooksName.map((book) => ({
                        id: book.id,
                        name: book.name,
                        publisher: book.publisher,
                    })),
                },
            })
            .code(200);

        return response;
    }

    if (reading) {
        // Jika ada query reading
        const filteredBooksReading = books.filter(
            (book) => Number(book.reading) === Number(reading),
        );

        const response = h
            .response({
                status: 'success',
                data: {
                    books: filteredBooksReading.map((book) => ({
                        id: book.id,
                        name: book.name,
                        publisher: book.publisher,
                    })),
                },
            })
            .code(200);

        return response;
    }

    // Jika ada query finished
    const filteredBooksFinished = books.filter(
        (book) => Number(book.finished) === Number(finished),
    );

    const response = h
        .response({
            status: 'success',
            data: {
                books: filteredBooksFinished.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        })
        .code(200);

    return response;
};

// Kriteria 3 : API dapat menampilkan detail buku
const getBookByIdHandler = (request, h) => {
    const {
        bookId
    } = request.params;

    // Menemukan buku berdasarkan id
    const book = books.filter((n) => n.id === bookId)[0];

    // Bila buku dengan id yang dilampirkan ditemukan, maka server harus mengembalikan respons dengan:
    if (book) {
        const response = h.response({
            status: 'success',
            data: {
                book,
            },
        }).code(200);
        return response;
    }

    // Bila buku dengan id yang dilampirkan oleh client tidak ditemukan,
    // maka server harus mengembalikan respons dengan:
    const response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
    }).code(404);
    return response;
};

// Kriteria 4 : API dapat mengubah data buku
const editBookByIdHandler = (request, h) => {
    const {
        bookId
    } = request.params;

    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading
    } = request.payload;

    // Server harus merespons gagal bila:
    if (!name) {
        /*
        Client tidak melampirkan properti namepada request body.
        Bila hal ini terjadi, maka server akan merespons dengan
        */
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku'
        }).code(400);
        return response;
    }

    if (readPage > pageCount) {
        /*
        Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount.
        Bila hal ini terjadi, maka server akan merespons dengan
        */
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
        }).code(400);
        return response;
    }

    const finished = pageCount == readPage;
    const updatedAt = new Date().toISOString();

    const index = books.findIndex((book) => book.id === bookId);
    if (index !== -1) {
        books[index] = {
            ...books[index],
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            finished,
            updatedAt
        };

        // Bila buku berhasil diperbarui, server harus mengembalikan respons dengan:
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil diperbarui',
        }).code(200);
        return response;
    }

    // Id yang dilampirkan oleh client tidak ditemukkan oleh server.
    // Bila hal ini terjadi, maka server akan merespons dengan:
    const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
    }).code(404);
    return response;
};

// Kriteria 5 : API dapat menghapus buku
const deleteBookByIdHandler = (request, h) => {
    const {
        bookId
    } = request.params;

    const index = books.findIndex((book) => book.id === bookId);

    if (index !== -1) {
        books.splice(index, 1);

        // Bila id dimiliki salah satu buku
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil dihapus',
        }).code(200);
        return response;
    }

    // Bila id tidak dimiliki buku manapun
    const response = h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
    }).code(404);
    return response;
};

module.exports = {
    addBookHandler,
    getAllBooksHandler,
    getBookByIdHandler,
    editBookByIdHandler,
    deleteBookByIdHandler
};