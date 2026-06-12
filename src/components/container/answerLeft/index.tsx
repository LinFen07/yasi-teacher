import './index.scss';
import stores from '@/stores';
import { observer } from 'mobx-react'
import { getComposition } from '@/api/studentAnswer';
import { useEffect, useState } from 'react';
import { Button, Modal } from 'antd'
import { stripHtmlTags } from '@/utils/browser/submitAnswer';

interface Article {
  id: number
  composition: string
  score: number | null
  review: string | null
}

const AnswerLeft = observer(() => {
  const [articleData, setArtical] = useState<Article[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  useEffect(() => {
    getComposition(stores.ExamStore.paperId).then((res: any) => {
      setArtical(res.response)
    })
  }, [stores.ExamStore.paperId])

  const handleOpenModal = (article: Article) => {
    setSelectedArticle(article)
    setIsModalOpen(true)
  }

  return (
    <div className='anlt'>
      <div className='anltContent'>
        {articleData.length > 0 &&
          articleData.slice(0, 2).map((article, index) => (
            <div className='appraise' key={article.id}>
              <div className='title'>考生作文{index + 1}</div>
              <div className='composition'>
                {article.composition}
              </div>
              <Button type="primary" onClick={() => handleOpenModal(article)} style={{ position: 'absolute', right: '18px', bottom: '18px' }}>
                查看详情
              </Button>
            </div>
          ))}
      </div>
      <Modal
        title="作文详情"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        {selectedArticle && (
          <div className="modal-content">
            <div className="composition-section">
              <div className="section-label">作文内容</div>
              <div className="composition-text">{selectedArticle.composition}</div>
            </div>

            <div className="info-row">
              <div className="info-item">
                <div className="section-label">得分</div>
                <div className="score-value">{selectedArticle.score ?? '未评分'}</div>
              </div>
              <div className="info-item">
                <div className="section-label">老师评价</div>
                <div className="review-value">{stripHtmlTags(selectedArticle.review ?? '') || '未评价'}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
})

export default AnswerLeft;