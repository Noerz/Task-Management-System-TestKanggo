import React from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  labelRightNode?: ReactNode;
  icon?: ReactNode;
  leftIcon?: ReactNode;
  onIconClick?: () => void;
}

export const Input: React.FC<InputProps> = ({ label, labelRightNode, icon, leftIcon, onIconClick, ...props }) => {
  return (
    <div className="input-wrapper">
      <div className="input-label-container">
        <label className="input-label">{label}</label>
        {labelRightNode && <div className="input-label-right">{labelRightNode}</div>}
      </div>
      <div className="input-container">
        {leftIcon && <div className="input-left-icon">{leftIcon}</div>}
        <input className={`input-field ${leftIcon ? 'has-left-icon' : ''}`} {...props} />
        {icon && (
          <button type="button" className="input-icon" onClick={onIconClick}>
            {icon}
          </button>
        )}
      </div>
    </div>
  );
};
