# Responsive Design Patterns Guide

## Pattern chung cho tất cả các trang

### 1. Container Pattern
```jsx
// Thay vì:
<div className="max-w-7xl mx-auto px-4 py-6">

// Sử dụng:
<div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
```

### 2. Card/Box Pattern
```jsx
// Thay vì:
<div className="bg-white rounded-xl p-4">

// Sử dụng:
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-5 lg:p-6">
```

### 3. Header Pattern
```jsx
// Thay vì:
<h2 className="text-2xl font-bold">

// Sử dụng:
<h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
```

### 4. Button Pattern
```jsx
// Thay vì:
<button className="px-4 py-2 bg-emerald-600 text-white rounded-lg">

// Sử dụng:
<button className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 text-sm sm:text-base font-medium">
```

### 5. Grid Pattern
```jsx
// Thay vì:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Sử dụng:
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
```

### 6. Text Pattern
```jsx
// Thay vì:
<p className="text-sm text-gray-600">

// Sử dụng:
<p className="text-xs sm:text-sm md:text-base text-gray-600">
```

### 7. Flex Container Pattern
```jsx
// Thay vì:
<div className="flex items-center justify-between">

// Sử dụng:
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
```

### 8. Input Pattern
```jsx
// Thay vì:
<input className="w-full pl-10 pr-4 py-2 border rounded-lg">

// Sử dụng:
<input className="w-full pl-9 sm:pl-10 md:pl-12 pr-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
```

### 9. Icon Pattern
```jsx
// Thay vì:
<svg className="h-5 w-5">

// Sử dụng:
<svg className="h-4 w-4 sm:h-5 sm:w-5">
```

### 10. Spacing Pattern
```jsx
// Margin/Padding responsive:
mb-3 sm:mb-4 md:mb-5 lg:mb-6
gap-2 sm:gap-3 md:gap-4 lg:gap-5
```

## Breakpoints
- `sm:` 640px (mobile landscape, small tablets)
- `md:` 768px (tablets)
- `lg:` 1024px (desktops)
- `xl:` 1280px (large desktops)
- `2xl:` 1536px (extra large desktops)

## Best Practices
1. Luôn bắt đầu với mobile-first (base classes không có prefix)
2. Sử dụng `flex-col` trên mobile, `flex-row` trên desktop
3. Text size: `text-xs sm:text-sm md:text-base lg:text-lg`
4. Padding: `p-3 sm:p-4 md:p-5 lg:p-6`
5. Gap: `gap-2 sm:gap-3 md:gap-4 lg:gap-5`
6. Grid columns: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
7. Luôn thêm `transition-all duration-200` cho interactive elements
8. Sử dụng `truncate` cho text dài trên mobile
9. Sử dụng `line-clamp-1 sm:line-clamp-none` cho subtitle
10. Thêm `flex-shrink-0` cho icons và buttons trong flex containers

