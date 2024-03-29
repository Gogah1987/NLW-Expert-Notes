import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'sonner';

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  

  const [shouldShowOnboard, setShouldShowOnboard] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [content, setContent] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  function handleStartEditor() {
    setShouldShowOnboard(false)
  }

  function handleCloseDialog() {
    setShouldShowOnboard(true)
    setContent('')
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value)

    if (event.target.value === '') {
      setShouldShowOnboard(true)
    }
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window
      || 'webkitSpeechRecognition' in window

    if (!isSpeechRecognitionAPIAvailable) {
      alert('Infelizmente seu navegador não suporta a API de gravação!')
      return
    }

    setIsRecording(true)
    setShouldShowOnboard(false)

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = 'pt-BR'
    speechRecognition.continuous = true
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '')

      setContent(transcription)
    }

    speechRecognition.onerror = (event) => {
      console.error(event)
    }

    speechRecognition.start()
  }

  function handleStopRecording() {
    setIsRecording(false)

    if (speechRecognition !== null) {
      speechRecognition.stop()
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault()

    if (content !== '') {
      onNoteCreated(content)
      toast.success('Nota criada com sucesso!')
      setContent('')
      setShouldShowOnboard(true)
      setDialogOpen(false)
    } else {
      toast.error('Você não pode adicionar uma nota vazia.')
    }


  }

  return (
    <Dialog.Root
      open={dialogOpen}
      onOpenChange={() => {
        setDialogOpen(!dialogOpen)
        handleCloseDialog()
      }}
    >
      <Dialog.Trigger className='rounded-md text-left flex flex-col text-top p-5 gap-3 bg-slate-700 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400'>
        <span className='text-sm font-medium text-slate-200'>
          Adicionar nota
        </span>
        <p className='text-sm leading-6 text-slate-400'>
          Grave uma nota em áudio que será convertida para texto automaticamente.
        </p>
      </Dialog.Trigger >

      <Dialog.Portal>
        <Dialog.Overlay className='inset-0 fixed bg-black/50'>
          <Dialog.Content className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none'>
            <Dialog.Close className='absolute top-0 right-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100'>
              <X className='size-5' />
            </Dialog.Close>

            <form className='flex-1 flex flex-col'>
              <div className='flex flex-1 flex-col gap-3 p-5'>
                <span className='text-sm font-medium text-slate-300'>
                  Adicionar nota
                </span>

                {shouldShowOnboard ? (
                  <p className='text-sm leading-6 text-slate-400'>
                    Comece{' '} <button type='button' onClick={handleStartRecording} className='font-medium text-lime-400 hover:underline'>gravando uma nota</button>{' '} em áudio ou se preferir{' '}<button type='button' onClick={handleStartEditor} className='font-medium text-lime-400 hover:underline'>utilize apenas texto</button>.
                  </p>
                ) : (
                  <textarea
                    autoFocus
                    className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none whitespace-pre-line' 
                    onChange={handleContentChanged}
                    value={content}
                  />
                )}

              </div>

              {isRecording ? (
                <button
                  type='button'
                  className='w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-xl text-slate-300 outline-none font-medium group hover:text-slate-100'
                  onClick={handleStopRecording}
                >
                  <div className='size-3 rounded-full bg-red-500 animate-pulse' />
                  Gravando! (Clique p/ interromper)
                </button>
              ) : (
                <button
                  type='button'
                  onClick={handleSaveNote}
                  className='w-full bg-lime-400 py-4 text-center text-xl text-lime-950 outline-none font-bold group hover:bg-lime-500'
                >
                  Salvar nota
                </button>
              )}
            </form>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}