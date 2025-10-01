# Sử dụng Node.js làm base image
FROM node:24

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose cổng chạy ứng dụng (Vite mặc định chạy trên cổng 5173)
EXPOSE 5173

# Chạy Vite trực tiếp mà không cần npm run dev
CMD ["npx", "vite", "--host"]
