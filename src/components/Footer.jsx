import logo from "../assets/images/logo.svg"

function Footer() {
  return (
    <footer className="bg-white text-neutral-700">
      <div className="w-full pl-12 pr-8 py-10 md:py-14 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-6 md:gap-8 items-start">
        <div>
          <img src={logo} alt="VinFast" className="h-20 w-auto object-contain" />
          <div className="mt-5 space-y-3 text-[15px] leading-6">
            <p><span className="font-semibold">Công ty TNHH Kinh doanh Thương mại và Dịch vụ VinFast</span></p>
            <p><span className="font-semibold">MST/MSDN:</span> 0108926276 do Sở KH&ĐT TP Hà Nội cấp lần đầu ngày 01/10/2019 <br></br>và các lần thay đổi tiếp theo.</p>
            <p><span className="font-semibold">Địa chỉ trụ sở chính:</span> Số 7, Đường Bằng Lăng 1, Khu đô thị Vinhomes Riverside,<br></br> Phường Việt Hưng, Thành phố Hà Nội, Việt Nam</p>
          </div>

          
        </div>

        <div>
          <ul className="space-y-6">
            <li className="font-semibold text-neutral-900">VỀ VINFAST</li>
            <li className="font-semibold text-neutral-900">VỀ VINGROUP</li>
            <li className="flex items-center justify-between font-semibold text-neutral-900">
              <span>TIN TỨC</span>
              <svg className="w-4 h-4 text-neutral-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.136l3.71-3.905a.75.75 0 111.08 1.04l-4.24 4.46a.75.75 0 01-1.08 0l-4.24-4.46a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
            </li>
            <li className="font-semibold text-neutral-900">SHOWROOM & ĐẠI LÝ</li>
            <li className="flex items-center justify-between font-semibold text-neutral-900">
              <span>ĐIỀU KHOẢN CHÍNH SÁCH</span>
              <svg className="w-4 h-4 text-neutral-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.136l3.71-3.905a.75.75 0 111.08 1.04l-4.24 4.46a.75.75 0 01-1.08 0l-4.24-4.46a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-neutral-900">DỊCH VỤ KHÁCH HÀNG</h4>
          <ul className="mt-4 space-y-4">
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.008 6.492 14.5 14.5 14.5h1.25a2.25 2.25 0 002.25-2.25v-2.02a1.25 1.25 0 00-1.086-1.24l-3.402-.425a1.25 1.25 0 00-1.18.58l-.9 1.35a.75.75 0 01-1.027.225 12.02 12.02 0 01-5.23-5.23.75.75 0 01.225-1.027l1.35-.9a1.25 1.25 0 00.58-1.18l-.425-3.402A1.25 1.25 0 008.27 4.75H6.25A2.25 2.25 0 004 7v-.25z"/></svg>
              <a href="tel:1900232389" className="hover:text-emerald-600">1900 23 23 89</a>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 8.25v7.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25v-7.5m19.5 0A2.25 2.25 0 0019.5 6h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.5a2.25 2.25 0 01-2.36 0l-7.5-4.5A2.25 2.25 0 012.25 8.493V8.25"/></svg>
              <a href="mailto:support.vn@vinfastauto.com" className="hover:text-emerald-600">support.vn@vinfastauto.com</a>
            </li>
          </ul>

          <h4 className="mt-6 font-semibold text-neutral-900">SPEAK-UP HOTLINE</h4>
          <ul className="mt-4 space-y-4">
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.008 6.492 14.5 14.5 14.5h1.25a2.25 2.25 0 002.25-2.25v-2.02a1.25 1.25 0 00-1.086-1.24l-3.402-.425a1.25 1.25 0 00-1.18.58l-.9 1.35a.75.75 0 01-1.027.225 12.02 12.02 0 01-5.23-5.23.75.75 0 01.225-1.027l1.35-.9a1.25 1.25 0 00.58-1.18l-.425-3.402A1.25 1.25 0 008.27 4.75H6.25A2.25 2.25 0 004 7v-.25z"/></svg>
              <a href="tel:+842444582193" className="hover:text-emerald-600">+84 24 4458 2193</a>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 8.25v7.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25v-7.5m19.5 0A2.25 2.25 0 0019.5 6h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.5a2.25 2.25 0 01-2.36 0l-7.5-4.5A2.25 2.25 0 012.25 8.493V8.25"/></svg>
              <a href="mailto:v.speakup@vinfast.vn" className="hover:text-emerald-600">v.speakup@vinfast.vn</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full pl-12 pr-8 pb-10">
        <div className="mb-8">
          <h4 className="font-semibold text-neutral-900">Kết nối với VinFast</h4>
          <div className="mt-4 flex items-center gap-4">
            <a aria-label="Facebook" href="#" className="w-8 h-8 rounded-full border border-neutral-300 grid place-items-center text-neutral-500 hover:border-neutral-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.49 17.52 2 11.94 2S2 6.49 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z"/></svg>
            </a>
            <a aria-label="YouTube" href="#" className="w-8 h-8 rounded-full border border-neutral-300 grid place-items-center text-neutral-500 hover:border-neutral-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.13-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.56A3 3 0 00.5 6.2 31.2 31.2 0 000 12a31.2 31.2 0 00.5 5.8 3 3 0 002.13 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.56A3 3 0 0023.5 17.8 31.2 31.2 0 0024 12a31.2 31.2 0 00-.5-5.8zM9.75 15.5v-7l6 3.5-6 3.5z"/></svg>
            </a>
          </div>
        </div>
      </div>

     
    </footer>
  )
}

export default Footer


