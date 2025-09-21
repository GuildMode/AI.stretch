import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useStretchStore } from '../store/stretchStore';
import useUiStore from '../store/uiStore';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
`;

const Column = styled.div``;

const Title = styled.h1`
  grid-column: 1 / -1;
  text-align: center;
  margin-bottom: 1rem;
`;

const Form = styled.form`
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  
  label { font-weight: 600; margin-bottom: 0.5rem; }
  input, textarea { padding: 0.8rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; font-family: inherit; }
  textarea { min-height: 80px; resize: vertical; }
  small { font-size: 0.8rem; color: #777; margin-top: 0.3rem; }
`;

const SubmitButton = styled.button`
  padding: 1rem; font-size: 1.1rem; font-weight: bold; color: #fff; background-color: #3498db; border: none; border-radius: 8px; cursor: pointer; transition: background-color 0.3s;
  &:hover { background-color: #2980b9; }
`;

const StretchList = styled.div`
  display: flex; flex-direction: column; gap: 1rem;
`;

const StretchItem = styled.div`
  background: #fff; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex; justify-content: space-between; align-items: center;
`;

const ActionButton = styled.button`
  padding: 8px 12px; font-size: 0.9rem; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.2s ease;
  &.edit { background-color: #f39c12; color: white; }
  &.delete { background-color: #e74c3c; color: white; }
`;

const PersistenceArea = styled.div`
  grid-column: 1 / -1;
  margin-top: 2rem;
  background: #fff7f7;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #e74c3c;
  text-align: center;
`;

const SaveButton = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #c0392b;
  }
`;

const emptyFormState = {
  id: '', name: '', nameEn: '', targetArea: '', description: '',
  duration: 30, points: '', effect: '', equipment: 'なし',
};

const DeveloperPage = () => {
  const {
    stretches,
    addStretch,
    updateStretch,
    deleteStretch,
  } = useStretchStore();
  const openModal = useUiStore(state => state.openModal);
  const [formState, setFormState] = useState(emptyFormState);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormState(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) : value }));
  };

  const handleEdit = (stretch) => {
    setEditingId(stretch.id);
    setFormState({
      ...stretch,
      targetArea: stretch.targetArea.join(', '),
      description: stretch.description.join('\n'),
      points: stretch.points.join('\n'),
    });
  };

  const handleDelete = (id) => {
    openModal({
      title: 'ストレッチを削除',
      message: `ID:「${id}」のストレッチを本当に削除しますか？この操作はメモリ上でのみ行われます。\n変更を永続化するには、下の「変更をファイルに保存」ボタンを押して、私に保存を依頼してください。`,
      confirmText: '削除',
      onConfirm: () => deleteStretch(id),
    });
  };

  const handlePersistence = () => {
    const content = JSON.stringify(stretches, null, 2);
    const filePath = 'public/data/stretch-data.json';

    const message = `以下のJSONデータをコピーし、私に「この内容を ${filePath} に保存して」と依頼してください。\n\n\`\`\`json\n${content}\n\`\`\``;

    openModal({
        title: 'ストレッチデータ',
        message: message,
    });
  };

  const clearForm = () => {
    setFormState(emptyFormState);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalObject = {
      ...formState,
      targetArea: formState.targetArea.split(',').map(s => s.trim()).filter(Boolean),
      description: formState.description.split('\n').filter(Boolean),
      points: formState.points.split('\n').filter(Boolean),
    };

    if (editingId) {
      updateStretch(finalObject);
    } else {
      // Check for duplicate ID
      if (stretches.some(s => s.id === finalObject.id)) {
        openModal({ title: 'エラー', message: '同じIDが既に存在します。固有のIDを入力してください。' });
        return;
      }
      addStretch(finalObject);
    }
    clearForm();
  };

  return (
    <PageContainer>
      <Title>開発者用：ストレッチ管理</Title>
      
      <Column>
        <h2>{editingId ? 'ストレッチを編集' : '新規ストレッチを追加'}</h2>
        <Form onSubmit={handleSubmit}>
          <InputGroup><label>ID</label><input type="text" name="id" value={formState.id} onChange={handleChange} required disabled={!!editingId} /></InputGroup>
          <InputGroup><label>名前 (日本語)</label><input type="text" name="name" value={formState.name} onChange={handleChange} required /></InputGroup>
          <InputGroup><label>名前 (英語)</label><input type="text" name="nameEn" value={formState.nameEn} onChange={handleChange} /></InputGroup>
          <InputGroup><label>対象部位</label><input type="text" name="targetArea" value={formState.targetArea} onChange={handleChange} /><small>カンマ区切り</small></InputGroup>
          <InputGroup><label>説明</label><textarea name="description" value={formState.description} onChange={handleChange} /><small>改行区切り</small></InputGroup>
          <InputGroup><label>推奨時間 (秒)</label><input type="number" name="duration" value={formState.duration} onChange={handleChange} min="10" /></InputGroup>
          <InputGroup><label>ポイント</label><textarea name="points" value={formState.points} onChange={handleChange} /><small>改行区切り</small></InputGroup>
          <InputGroup><label>効果</label><textarea name="effect" value={formState.effect} onChange={handleChange} /></InputGroup>
          <InputGroup><label>道具</label><input type="text" name="equipment" value={formState.equipment} onChange={handleChange} /></InputGroup>
          <SubmitButton type="submit">{editingId ? '更新する' : '追加する'}</SubmitButton>
          {editingId && <button type="button" onClick={clearForm}>キャンセル</button>}
        </Form>
      </Column>

      <Column>
        <h2>現在のストレッチ一覧</h2>
        <StretchList>
          {stretches.map(stretch => (
            <StretchItem key={stretch.id}>
              <span>{stretch.name} ({stretch.id})</span>
              <div>
                <ActionButton className="edit" onClick={() => handleEdit(stretch)}>編集</ActionButton>
                <ActionButton className="delete" onClick={() => handleDelete(stretch.id)} style={{marginLeft: '10px'}}>削除</ActionButton>
              </div>
            </StretchItem>
          ))}
        </StretchList>
      </Column>

      <PersistenceArea>
        <h2>変更の永続化</h2>
        <p>メモリ上で行った変更（追加・編集・削除）を実際のファイルに書き込むには、以下のボタンを押してください。</p>
        <SaveButton onClick={handlePersistence}>変更をファイルに保存</SaveButton>
      </PersistenceArea>
    </PageContainer>
  );
};

export default DeveloperPage;