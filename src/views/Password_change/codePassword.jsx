import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import React from 'react';

import { resetPasswordVerify } from '../../api/auth'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../assets/img/hola.png';
import { useTranslation } from 'react-i18next';

const ResetPasswordVerifyForm = () => {
    const navigate = useNavigate();
    const [codes, setCodes] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const { t } = useTranslation('global');

    // Helper function to handle input changes and focus management
    const handleCodeChange = (index, value) => {
        const newCodes = [...codes];
        newCodes[index] = value;
        setCodes(newCodes);

        // Move to next input if current one is filled
        if (value !== '' && index < codes.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
        // Move to previous input if backspace is pressed and current input is empty
        if (value === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (index < codes.length - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const resetCode = codes.join('');
        try {
            const response = await resetPasswordVerify({ resetCode });
            toast.success(t('reset_password_verify.valid_code'));
            setTimeout(() => {
                navigate('/newPassword');
            }, 3000);
        } catch (error) {
            console.error(error);
            toast.error(t('reset_password_verify.invalid_code'));
        }
    };

    return (
        <div className="bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 min-h-screen flex justify-center items-center">
            <div className="bg-gradient-to-r from-violet-600 to-rose-500 rounded-xl shadow-xl shadow-zinc-950 py-10 px-6 mx-4">
                <h1 className="text-center font-black text-xl text-slate-100 rounded-xl ">{t('reset_password_verify.sent_code')}</h1>
                <p className="italic font-semibold text-center text-lg text-slate-300 ">{t('reset_password_verify.enter_code')}</p>
                <div className="w-full flex flex-col items-center">
                    <img src={logo} alt="Logo" className="h-40" />
                </div>
                <form onSubmit={handleSubmit} className="my-3">
                    <div className="flex flex-col space-y-5">
                        <div className="flex justify-center items-center space-x-2">
                            {codes.map((code, index) => (
                                <input
                                    key={index}
                                    ref={(el) => inputRefs.current[index] = el}
                                    type="text"
                                    className="block w-10 h-10 bg-white text-center text-xl rounded-lg focus:outline-none focus:border-slate-500 hover:shadow"
                                    maxLength="1"
                                    value={code}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    autoFocus={index === 0} // Automatically focus the first input
                                />
                            ))}
                        </div>
                        <button
                            type="submit"
                            className="py-2 font-medium text-white bg-gradient-to-r from-cyan-300 to-cyan-800 rounded-lg"
                        >
                            <span>{t('reset_password_verify.confirm_code')}</span>
                        </button>
                        <p className="text-center text-slate-100 font-medium">
                            {t('reset_password_verify.not_received')}{' '}
                            <Link to="/reset" className="text-black hover:bg-white">
                                {t('reset_password_verify.request_new')}
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
};

export default ResetPasswordVerifyForm;
