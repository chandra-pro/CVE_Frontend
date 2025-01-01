/*
====================
FilterModal.js
Filter Modal for Report Generation
Author: Shubham, Chandramani Kumar
===================
*/


import React, { useState, useEffect } from 'react';

const availablePatchStatuses = ["CHECK-MANUALLY", "FIXED", "OPEN", "UNUSED"];

const FilterModal = ({projectName, tool, onApplyFilters, onClose }) => {
    const [selectedFilters, setSelectedFilters] = useState({
        sections: {
            description: false,
            cvssV2: false,
            cvssV3_1: false,
            weaknesses: false,
            references: false,
        },
        textFilters: {
            reportName: '',
            patchStatus: '',
            publishedDate: '',
            cvssV2Base: '',
            cvssV2Exploitability: '',
            cvssV2Impact: '',
            cvssV3_1Base: '',
            cvssV3_1Exploitability: '',
            cvssV3_1Impact: '',
        },
    });

    const [selectedPatchStatuses, setSelectedPatchStatuses] = useState([]);
    const [errors, setErrors] = useState({});

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setSelectedFilters((prev) => ({
            ...prev,
            sections: { ...prev.sections, [name]: checked },
        }));
    };

    const handleTextChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for Report Name
    if (name === 'reportName') {
        // Remove any spaces and special characters, only allow alphanumeric and hyphen
        const sanitizedValue = value.replace(/[^a-zA-Z0-9-_]/g, '');
        setSelectedFilters((prev) => ({
            ...prev,
            textFilters: { ...prev.textFilters, [name]: sanitizedValue },
        }));
    } else {
        // For all other fields, retain the usual handling
        setSelectedFilters((prev) => ({
            ...prev,
            textFilters: { ...prev.textFilters, [name]: value },
        }));
    }
};
    

    const handlePatchStatusSelect = (status) => {
        setSelectedPatchStatuses((prev) =>
            prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status]
        );
    };

    useEffect(() => {
        setSelectedFilters((prev) => ({
            ...prev,
            textFilters: {
                ...prev.textFilters,
                patchStatus: selectedPatchStatuses.join(' '),
            },
        }));
    }, [selectedPatchStatuses]);

    const validateFields = () => {
        const newErrors = {};
        const datePattern = /^\d{2}-\d{2}-\d{4}$/;

        // Add report name validation - only check for spaces
        if (selectedFilters.textFilters.reportName && selectedFilters.textFilters.reportName.includes(' ')) {
            newErrors.reportName = "Report name cannot contain spaces";
        }

        if (selectedFilters.textFilters.publishedDate && !datePattern.test(selectedFilters.textFilters.publishedDate)) {
            newErrors.publishedDate = "Published Date must be in dd-mm-yyyy format.";
        }

        const isFloat = (value) => /^\d*\.?\d+$/.test(value);

        const fieldsToValidate = [
            { field: 'cvssV2Base', section: 'cvssV2' },
            { field: 'cvssV2Exploitability', section: 'cvssV2' },
            { field: 'cvssV2Impact', section: 'cvssV2' },
            { field: 'cvssV3_1Base', section: 'cvssV3_1' },
            { field: 'cvssV3_1Exploitability', section: 'cvssV3_1' },
            { field: 'cvssV3_1Impact', section: 'cvssV3_1' }
        ];

        fieldsToValidate.forEach(({ field, section }) => {
            const isSectionChecked = selectedFilters.sections[section] || Object.values(selectedFilters.sections).every(v => !v);
            if (isSectionChecked && selectedFilters.textFilters[field] !== '' && !isFloat(selectedFilters.textFilters[field])) {
                newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')} must be a valid float number.`;
            }
        });

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateFields();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        onApplyFilters(selectedFilters);
    };

    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg w-full max-w-2xl h-[92vh] flex flex-col"
                onClick={handleModalClick}
            >
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Filter Options for Project: {projectName}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-md"
                    >
                        <span className="sr-only">Close</span>
                        ✕
                    </button>
                </div>    


                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Sections */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Sections</h3>
                            <p className="text-gray-600">
                                Select sections required in the reports. All sections would be included if none is selected.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.keys(selectedFilters.sections).map((key) => (
                                    <label key={key} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                                        <input
                                            type="checkbox"
                                            name={key}
                                            checked={selectedFilters.sections[key]}
                                            onChange={handleCheckboxChange}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span>{key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ').replace('CvssV2', 'CVSS V2').replace('CvssV3_1', 'CVSS V3.1')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Filters Section */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold">Filters</h3>
                                <p className="text-gray-600 mt-1">Leave empty if no minimum score is required</p>
                            </div>

                            <div className="space-y-2">
                                <label className="block font-medium">
                                    Report Name:
                                    <input
                                        type="text"
                                        name="reportName"
                                        value={selectedFilters.textFilters.reportName}
                                        onChange={handleTextChange}
                                        placeholder="Enter Report Name"
                                        className={`w-full mt-1 px-3 py-2 border rounded-md ${
                                            errors.reportName ? 'border-red-500' : ''
                                        }`}
                                    />
                                </label>
                                {errors.reportName && (
                                    <p className="text-red-500 text-sm">{errors.reportName}</p>
                                )}
                            </div>

                            {/* Patch Status */}
                            {tool !== 'CVEHMI' && (
                                <div className="space-y-2">
                                    <label className="block font-medium">Patch Status:</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availablePatchStatuses.map(status => (
                                            <button
                                                type="button"
                                                key={status}
                                                onClick={() => handlePatchStatusSelect(status)}
                                                className={`px-3 py-1.5 rounded-md transition-colors ${
                                                    selectedPatchStatuses.includes(status)
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                                }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        name="patchStatus"
                                        value={selectedPatchStatuses.join(', ')}
                                        readOnly
                                        className="w-full mt-2 px-3 py-2 border rounded-md bg-gray-50"
                                    />
                                </div>
                            )}

                            {/* Date Field */}
                            <div className="space-y-2">
                                <label className="block font-medium">
                                    Published Date (dd-mm-yyyy):
                                    <input
                                        type="text"
                                        name="publishedDate"
                                        value={selectedFilters.textFilters.publishedDate}
                                        onChange={handleTextChange}
                                        placeholder="20-05-2022"
                                        className={`w-full mt-1 px-3 py-2 border rounded-md ${
                                            errors.publishedDate ? 'border-red-500' : ''
                                        }`}
                                    />
                                </label>
                                {errors.publishedDate && (
                                    <p className="text-red-500 text-sm">{errors.publishedDate}</p>
                                )}
                            </div>

                            {/* CVSS Scores */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* CVSS V2 Fields */}
                                {(selectedFilters.sections.cvssV2 || Object.values(selectedFilters.sections).every(v => !v)) && (
                                    <div className="space-y-4">
                                        <h4 className="font-medium">CVSS V2 Scores</h4>
                                        <div className="space-y-4">
                                            {[
                                                { name: 'cvssV2Base', label: 'Base' },
                                                { name: 'cvssV2Exploitability', label: 'Exploitability' },
                                                { name: 'cvssV2Impact', label: 'Impact' }
                                            ].map(field => (
                                                <div key={field.name}>
                                                    <label className="block">
                                                        <span className="block text-sm font-medium text-gray-700">
                                                            {field.label} (Minimum Score):
                                                        </span>
                                                        <input
                                                            type="text"
                                                            name={field.name}
                                                            value={selectedFilters.textFilters[field.name]}
                                                            onChange={handleTextChange}
                                                            placeholder="Minimum Score"
                                                            className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                                                                errors[field.name] ? 'border-red-500' : ''
                                                            }`}
                                                        />
                                                    </label>
                                                    {errors[field.name] && (
                                                        <p className="text-red-500 text-sm">{errors[field.name]}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CVSS V3.1 Fields */}
                                {(selectedFilters.sections.cvssV3_1 || Object.values(selectedFilters.sections).every(v => !v)) && (
                                    <div className="space-y-4">
                                        <h4 className="font-medium">CVSS V3.1 Scores</h4>
                                        <div className="space-y-4">
                                            {[
                                                { name: 'cvssV3_1Base', label: 'Base' },
                                                { name: 'cvssV3_1Exploitability', label: 'Exploitability' },
                                                { name: 'cvssV3_1Impact', label: 'Impact' }
                                            ].map(field => (
                                                <div key={field.name}>
                                                    <label className="block">
                                                        <span className="block text-sm font-medium text-gray-700">
                                                            {field.label} (Minimum Score):
                                                        </span>
                                                        <input
                                                            type="text"
                                                            name={field.name}
                                                            value={selectedFilters.textFilters[field.name]}
                                                            onChange={handleTextChange}
                                                            placeholder="Minimum Score"
                                                            className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                                                                errors[field.name] ? 'border-red-500' : ''
                                                            }`}
                                                        />
                                                    </label>
                                                    {errors[field.name] && (
                                                        <p className="text-red-500 text-sm">{errors[field.name]}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-4 border-t">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;


