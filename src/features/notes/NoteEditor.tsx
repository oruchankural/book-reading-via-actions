import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const noteSchema = z.object({
  text: z.string().trim().max(1000, 'tooLong'),
})

type NoteForm = z.infer<typeof noteSchema>

interface NoteEditorProps {
  page: number
  quote: string
  initialText: string
  /** Notes need text; highlights/underlines may have none. */
  requireText: boolean
  onSave: (text: string) => void
  onDelete?: () => void
  onClose: () => void
}

export function NoteEditor({
  page,
  quote,
  initialText,
  requireText,
  onSave,
  onDelete,
  onClose,
}: NoteEditorProps): React.JSX.Element {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<NoteForm>({ resolver: zodResolver(noteSchema), defaultValues: { text: initialText } })

  const message = errors.text?.message

  return (
    <form
      onSubmit={handleSubmit((v) => {
        if (requireText && v.text.length === 0) {
          setError('text', { message: 'tooShort' })
          return
        }
        onSave(v.text)
      })}
      className="fixed inset-x-3 bottom-3 z-30 flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 sm:inset-x-auto sm:right-4 sm:w-80 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{t('notes.page', { page })}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-1 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:hover:text-zinc-100"
        >
          {t('notes.close')}
        </button>
      </div>
      {quote && (
        <blockquote className="line-clamp-3 border-l-2 border-amber-600 pl-2 text-xs italic text-zinc-500">
          {quote}
        </blockquote>
      )}
      <textarea
        {...register('text')}
        autoFocus
        rows={4}
        placeholder={t('notes.placeholder')}
        aria-label={t('notes.placeholder')}
        aria-invalid={Boolean(message)}
        className="resize-none rounded-md border border-zinc-200 bg-transparent p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:border-zinc-800"
      />
      {message && (
        <p role="alert" className="text-xs text-red-600">
          {t(`notes.${message}`)}
        </p>
      )}
      <div className="flex items-center justify-between">
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:hover:bg-red-950"
          >
            {t('notes.delete')}
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          className="h-8 rounded-md bg-amber-600 px-3 text-xs font-medium text-white hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
        >
          {t('notes.save')}
        </button>
      </div>
    </form>
  )
}
