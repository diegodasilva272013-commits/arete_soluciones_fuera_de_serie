'use client';
/**
 * Formulario de ingreso animado (modern-animated-sign-in, 21st.dev), adaptado a la marca
 * de Providus: campos oscuros con el brillo que sigue al mouse, cada elemento se revela con
 * una cortina, y el botón con el filo de luz. Se conservan la estructura y las animaciones
 * del original; cambian los colores (bronce, arena y naranja del logo), los textos en
 * español, el campo `name` (el original leía los valores por la etiqueta) y se suma el
 * estado de "ingresando" y el error del servidor.
 */
import {
  memo,
  ReactNode,
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  forwardRef,
} from 'react';
import {
  motion,
  useAnimation,
  useInView,
  useMotionTemplate,
  useMotionValue,
} from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== Input ====================

const Input = memo(
  forwardRef(function Input(
    { className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>,
    ref: React.ForwardedRef<HTMLInputElement>
  ) {
    const radius = 110; // radio del brillo que sigue al mouse
    const [visible, setVisible] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    return (
      <motion.div
        style={{
          background: useMotionTemplate`
        radial-gradient(
          ${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
          #e0603a,
          #e3c58e 45%,
          transparent 80%
        )
      `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className='group/input rounded-xl p-[2px] transition duration-300'
      >
        <input
          type={type}
          className={cn(
            `flex h-12 w-full rounded-[10px] border-none bg-[#2b2118] px-3.5 py-2 text-[15px] text-[#ebe6dd] shadow-[inset_0_0_0_1px_rgba(227,197,142,0.14)] transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#8a7a64] focus-visible:ring-[2px] focus-visible:ring-[#e3c58e]/70 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50`,
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  })
);

Input.displayName = 'Input';

// ==================== BoxReveal ====================

type BoxRevealProps = {
  children: ReactNode;
  width?: string;
  boxColor?: string;
  duration?: number;
  overflow?: string;
  position?: string;
  className?: string;
};

const BoxReveal = memo(function BoxReveal({
  children,
  width = 'fit-content',
  boxColor,
  duration,
  overflow = 'hidden',
  position = 'relative',
  className,
}: BoxRevealProps) {
  const mainControls = useAnimation();
  const slideControls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      slideControls.start('visible');
      mainControls.start('visible');
    } else {
      slideControls.start('hidden');
      mainControls.start('hidden');
    }
  }, [isInView, mainControls, slideControls]);

  return (
    <section
      ref={ref}
      style={{
        position: position as 'relative' | 'absolute' | 'fixed' | 'sticky' | 'static',
        width,
        overflow,
      }}
      className={className}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial='hidden'
        animate={mainControls}
        transition={{ duration: duration ?? 0.5, delay: 0.25 }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{ hidden: { left: 0 }, visible: { left: '100%' } }}
        initial='hidden'
        animate={slideControls}
        transition={{ duration: duration ?? 0.5, ease: 'easeIn' }}
        style={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          zIndex: 20,
          background: boxColor ?? '#c94b27',
          borderRadius: 4,
        }}
      />
    </section>
  );
});

// ==================== AnimatedForm ====================

type FieldType = 'text' | 'email' | 'password';

type Field = {
  label: string;
  name: string;
  required?: boolean;
  type: FieldType;
  placeholder?: string;
  autoComplete?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

type AnimatedFormProps = {
  header: string;
  subHeader?: string;
  fields: Field[];
  submitButton: string;
  loadingButton?: string;
  loading?: boolean;
  textVariantButton?: string;
  errorField?: string | null;
  fieldPerRow?: number;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  goTo?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

type Errors = {
  [key: string]: string;
};

const AnimatedForm = memo(function AnimatedForm({
  header,
  subHeader,
  fields,
  submitButton,
  loadingButton = 'Ingresando…',
  loading = false,
  textVariantButton,
  errorField,
  onSubmit,
  goTo,
}: AnimatedFormProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});

  const toggleVisibility = () => setVisible(!visible);

  const validateForm = (event: FormEvent<HTMLFormElement>) => {
    const currentErrors: Errors = {};
    fields.forEach((field) => {
      const value = (event.target as HTMLFormElement)[field.name]?.value;

      if (field.required && !value) {
        currentErrors[field.name] = `Completá ${field.label.toLowerCase()}.`;
      }
    });
    return currentErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    const formErrors = validateForm(event);

    if (Object.keys(formErrors).length === 0) {
      setErrors({});
      onSubmit(event);
    } else {
      setErrors(formErrors);
    }
  };

  const cortina = '#43362a';

  return (
    <section className='flex w-full max-w-[400px] flex-col gap-4'>
      <BoxReveal boxColor={cortina} duration={0.3}>
        <h1 className='pv-display text-[34px] leading-[1.02] text-[#ebe6dd] lg:text-[40px]'>{header}</h1>
      </BoxReveal>

      {subHeader && (
        <BoxReveal boxColor={cortina} duration={0.3} className='pb-2'>
          <p className='max-w-[34ch] text-[15px] leading-relaxed text-[#b4a892]'>{subHeader}</p>
        </BoxReveal>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <section className='mb-4 grid grid-cols-1'>
          {fields.map((field) => (
            <section key={field.name} className='flex flex-col gap-2'>
              <BoxReveal boxColor={cortina} duration={0.3}>
                <Label htmlFor={field.name}>{field.label}</Label>
              </BoxReveal>

              <BoxReveal
                width='100%'
                boxColor={cortina}
                duration={0.3}
                className='flex w-full flex-col space-y-2'
              >
                <section className='relative'>
                  <Input
                    type={field.type === 'password' ? (visible ? 'text' : 'password') : field.type}
                    id={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    autoCapitalize='none'
                    autoCorrect='off'
                    spellCheck={false}
                    disabled={loading}
                    onChange={field.onChange}
                  />

                  {field.type === 'password' && (
                    <button
                      type='button'
                      onClick={toggleVisibility}
                      aria-label={visible ? 'Ocultar clave' : 'Mostrar clave'}
                      aria-pressed={visible}
                      className='absolute inset-y-0 right-0 grid w-12 place-items-center text-[#b4a892] transition-colors hover:text-[#ebe6dd]'
                    >
                      {visible ? <Eye className='h-5 w-5' aria-hidden='true' /> : <EyeOff className='h-5 w-5' aria-hidden='true' />}
                    </button>
                  )}
                </section>

                <section className='min-h-4'>
                  {errors[field.name] && (
                    <p role='alert' className='text-xs text-[#f08a73]'>{errors[field.name]}</p>
                  )}
                </section>
              </BoxReveal>
            </section>
          ))}
        </section>

        {errorField && (
          <p role='alert' className='mb-4 rounded-xl bg-[#4a1f18] px-4 py-3 text-[13px] font-medium leading-snug text-[#f6b9a8]'>{errorField}</p>
        )}

        <BoxReveal width='100%' boxColor={cortina} duration={0.3} overflow='visible'>
          <button
            className='pv-boton group/btn relative block h-12 w-full touch-manipulation rounded-xl font-semibold text-[#fff6ef] outline-hidden hover:cursor-pointer disabled:cursor-wait'
            type='submit'
            disabled={loading}
          >
            {loading ? loadingButton : <>{submitButton} &rarr;</>}
            <BottomGradient />
          </button>
        </BoxReveal>

        {textVariantButton && goTo && (
          <BoxReveal boxColor={cortina} duration={0.3}>
            <section className='mt-4 text-center'>
              <button
                type='button'
                className='min-h-11 text-sm text-[#e3c58e] outline-hidden transition-colors hover:text-[#ebe6dd] hover:cursor-pointer'
                onClick={goTo}
              >
                {textVariantButton}
              </button>
            </section>
          </BoxReveal>
        )}
      </form>
    </section>
  );
});

const BottomGradient = () => {
  return (
    <>
      <span className='absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-[#e3c58e] to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100' />
      <span className='absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-[#e0603a] to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100' />
    </>
  );
};

// ==================== Label ====================

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

const Label = memo(function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none text-[#ebe6dd] peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
});

// ==================== Exports ====================

export { Input, BoxReveal, AnimatedForm, Label, BottomGradient };
