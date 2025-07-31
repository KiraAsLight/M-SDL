exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Email sudah digunakan' });
  }
  
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(500).json({ message: 'Koneksi database gagal' });
  }
  
  res.status(500).json({ 
    message: 'Terjadi kesalahan',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
};