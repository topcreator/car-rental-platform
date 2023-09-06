import React, { ReactNode, useEffect, useRef } from 'react'

import '../assets/css/accordion.css'

const Accordion = ({
  title,
  className,
  collapse,
  offsetHeight = 0,
  children
}: {
  title?: string,
  className?: string,
  collapse?: boolean,
  offsetHeight?: number,
  children: ReactNode
}) => {
  const accordionRef = useRef<HTMLLabelElement>(null)

  const handleAccordionClick = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.classList.toggle('accordion-active')
    const panel = e.currentTarget.nextElementSibling as HTMLDivElement
    const collapse = panel.classList.contains('panel-collapse')

    if (panel.style.maxHeight || collapse) {
      if (collapse) {
        panel.classList.remove('panel-collapse')
        panel.classList.add('panel')
      }

      panel.style.maxHeight = ''
    } else {
      panel.style.maxHeight = panel.scrollHeight + 'px'
    }
  }

  useEffect(() => {
    if (collapse && accordionRef.current) {
      const panel = accordionRef.current.nextElementSibling as HTMLDivElement
      accordionRef.current.classList.toggle('accordion-active')
      panel.style.maxHeight = panel.scrollHeight + offsetHeight + 'px'
    }
  }, [collapse, offsetHeight])

  return (
    <div className={`${className ? `${className} ` : ''}accordion-container`}>
      <label ref={accordionRef} className="accordion" onClick={handleAccordionClick}>
        {title}
      </label>
      <div className={collapse ? 'panel-collapse' : 'panel'}>{children}</div>
    </div>
  )
}

export default Accordion
