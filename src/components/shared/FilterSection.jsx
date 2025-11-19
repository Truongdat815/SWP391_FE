import Dropdown from '../ui/Dropdown';

const FilterSection = ({ filters, className }) => {
  return (
    <div className={`flex gap-4 items-end ${className}`}>
      {filters.map((filter, index) => (
        <div key={index} className="flex-1">
          {filter.label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
          )}
          <Dropdown
            options={filter.options}
            value={filter.value}
            onChange={filter.onChange}
            placeholder={filter.placeholder || 'Tất cả'}
          />
        </div>
      ))}
    </div>
  );
};

export default FilterSection;

