import classNames from "classnames";
import { forwardRef, Fragment } from "react";
import useToast from "../hooks/useToast";
import { useCopyToClipboard } from "react-use";

export const Input = forwardRef(
  ({ disabled, error, className, id, ...rest }, ref) => {
    const inputErrorId = `input-${id}-error`;

    return (
      <Fragment>
        <div
          className={classNames("wrapper", className, {
            disabled,
            error,
          })}
        >
          <div className="input-wrapper">
            <input
              aria-invalid={Boolean(error) ? true : undefined}
              aria-describedby={Boolean(error) ? inputErrorId : undefined}
              ref={ref}
              min="none"
              disabled={disabled}
              {...rest}
            />
          </div>
          <style jsx>{`
            .wrapper {
              align-items: center;
              border-radius: var(--radius);
              border: 1px solid var(--grey);
              display: inline-flex;
              position: relative;
              transition: border 0.2s ease, color 0.2s ease;
              width: 100%;
              height: 40px;
            }
            .wrapper:focus-within {
              box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
              border-color: var(--offwhite);
            }

            .input-wrapper {
              display: block;
              position: relative;
              width: 100%;
              margin: 0px 12px;
            }

            .error,
            .error:focus-within {
              border-color: #e00;
            }
            .error input {
              color: #e00;
            }

            input {
              box-shadow: none;
              display: block;
              font-size: 16px;
              line-height: 1.5;
              width: 100%;
              color: var(--offwhite);
              background-color: transparent;
              caret-color: var(--primary);
              border-radius: 0px;
              border-width: initial;
              border-style: none;
              border-color: initial;
              border-image: initial;
              outline: 0px;
              padding: 0;
            }
            input:disabled {
              cursor: not-allowed;
              color: var(--dark-grey);
            }
          `}</style>
          <style jsx>{`
            .wrapper.disabled {
              cursor: not-allowed;
              background: var(--offwhite);
            }
          `}</style>
        </div>
        {Boolean(error) && (
          <div
            className="text-sm text-red mt-2 crop leading-snug"
            id={inputErrorId}
          >
            <b>Error: </b>
            {error?.message}
          </div>
        )}
      </Fragment>
    );
  }
);

export const LabeledInput = forwardRef(
  ({ label, labelPosition, className, ...rest }, ref) => (
    <div
      className={classNames(
        "wrapper",
        {
          right: labelPosition === "right",
        },
        className
      )}
    >
      <span className="label">{label ?? "ETH"}</span>
      <Input className="inner-input text-white" ref={ref} {...rest} />
      <style jsx>{`
        .label {
          background-color: rgba(0, 255, 173, 0.25);
          border-bottom-left-radius: var(--radius);
          border-top-left-radius: var(--radius);
          line-height: 1;
          text-transform: uppercase;
          color: rgba(0, 255, 173, 1);
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          width: initial;
          margin: 0px;
          border: 1px solid var(--grey);
          padding: 0px 12px;
        }

        .wrapper {
          display: flex;
          width: initial;
        }
        .wrapper.right {
          flex-direction: row-reverse;
        }

        .wrapper:not(.right) .label {
          border-right: none;
        }
        .wrapper.right .label {
          border-bottom-left-radius: 0px;
          border-bottom-right-radius: var(--radius);
          border-top-left-radius: 0px;
          border-top-right-radius: var(--radius);
          border-left: 0px;
        }

        .wrapper :global(.inner-input) {
          border-bottom-left-radius: 0px;
          border-top-left-radius: 0px;
          flex: 1 1 0%;
        }
        .wrapper.right :global(.inner-input) {
          border-bottom-left-radius: var(--radius);
          border-bottom-right-radius: 0px;
          border-top-left-radius: var(--radius);
          border-top-right-radius: 0px;
        }
      `}</style>
    </div>
  )
);

export const ClipboardInput = ({ disabled, className, value, ...rest }) => {
  const [copyState, copyToClipboard] = useCopyToClipboard();
  const addToast = useToast();

  const showToast = () => {
    if (copyState.error) {
      addToast({
        body: copyState.error.message,
        type: "error",
      });
      return;
    }
    addToast({
      body: "Link copied to clipboard",
      type: "success",
      hideAfter: 3,
    });
  };

  const handleClick = () => {
    copyToClipboard(value);
    showToast();
  };

  return (
    <div className={classNames("wrapper", className)}>
      <input value={value} {...rest} readOnly={true} />
      <div className="mr-2 flex items-center">
        <button onClick={handleClick}>
          <img
            src="/clipboard-icon.svg"
            alt="clipboard icon"
            className="cursor-pointer"
          />
        </button>
      </div>
      <style jsx>{`
        .wrapper {
          align-items: center;
          border-radius: var(--radius);
          border: 2px solid var(--grey);
          display: inline-flex;
          justify-content: space-between;
          position: relative;
          transition: border 0.2s ease, color 0.2s ease;
          max-width: 350px;
          height: 40px;
          outline: 0;
        }
        .wrapper:focus-within {
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
          border-color: var(--primary);
        }

        input {
          box-shadow: none;
          display: block;
          font-size: 16px;
          line-height: 1.5;
          width: 100%;
          color: var(--offwhite);
          background-color: transparent;
          caret-color: var(--primary);
          border-radius: 0px;
          border-width: initial;
          border-style: none;
          border-color: initial;
          border-image: initial;
          outline: 0px;
          padding: 0;
          margin: 0 12px;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
};

export const Radio = forwardRef(({ className, label, id, ...rest }, ref) => {
  const cachedClassNames = classNames("", className);

  return (
    <label className={cachedClassNames} htmlFor={id}>
      <input id={id} type="radio" ref={ref} {...rest} />
      <div className="radio" />
      <div className="text">{label}</div>

      <style jsx>{`
        label {
          display: inline-flex;
          align-items: center;
          font-size: 14px;
          height: 24px;
          user-select: none;
        }

        input {
          border: 0;
          clip: rect(0 0 0 0);
          height: 1px;
          margin: -1px;
          overflow: hidden;
          padding: 0;
          position: absolute;
          width: 1px;
          whitespace: nowrap;
          wordwrap: normal;
        }

        input:checked ~ .radio {
          background-color: var(--secondary);
          border-color: var(--secondary);
        }
        input:focus ~ .radio {
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
        }

        .radio {
          height: 16px;
          width: 16px;
          border-radius: 99999px;
          background-color: #e9e9e9;
          border: 1px solid;
          border-color: #979797;
        }

        input:checked ~ .text {
          color: var(--primary);
        }

        .text {
          line-height: 1;
          margin-top: 1px;
          margin-left: 0.5em;
          color: var(--light-grey);
        }
      `}</style>
    </label>
  );
});

export const RadioTab = forwardRef(
  ({ className, label, id, mobileGallery, ...rest }, ref) => {
    const cachedClassNames = classNames("", className);
    const cachedTextClassNames = classNames(
      "text",
      mobileGallery ? "mobile-gallery" : ""
    );

    return (
      <label className={cachedClassNames} htmlFor={id}>
        <input id={id} type="radio" ref={ref} {...rest} />
        <div className={cachedTextClassNames}>{label}</div>

        <style jsx>{`
          label {
            flex: 1;
          }

          .text {
            border: none;
            padding: 8px 10px;
            margin: 0;
            font-size: 20px;
            line-height: 24px;
            text-align: left;
            background: transparent;
            appearance: none;
            outline: none;
            position: relative;
          }

          .text.mobile-gallery {
            padding: 8px 1rem;
          }

          .text::after {
            position: absolute;
            bottom: 0;
            width: 100%;
            left: 0;
            content: "";
            border-bottom: 1px solid var(--light-grey);
          }

          input {
            border: 0;
            clip: rect(0 0 0 0);
            height: 1px;
            margin: -1px;
            overflow: hidden;
            padding: 0;
            position: absolute;
            width: 1px;
            whitespace: nowrap;
            wordwrap: normal;
          }

          input:checked ~ .text {
            color: var(--secondary);
          }

          input:checked ~ .text::after {
            border-width: 1px;
            border-color: var(--secondary);
          }
        `}</style>
      </label>
    );
  }
);

export const GalleryInput = forwardRef(({ label, sortOptions, name }, ref) => {
  return (
    <div className="mb-2 flex flex-row items-center">
      <label
        className="text-sm font-bold mr-2 whitespace-no-wrap"
        htmlFor={label}
      >
        {label}
      </label>
      <Select
        options={sortOptions}
        name={name}
        id={label}
        ref={ref}
        required
        defaultValue={0}
      />
    </div>
  );
});
