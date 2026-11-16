import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  Save,
  Upload,
  FileText,
  Globe,
  Lock,
  Megaphone,
  Send,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Sparkles,
  RotateCcw,
  Tag,
  Check,
  Heart,
  Image as ImageIcon,
  Snowflake,
  Cloud,
  Copy,
  Feather,
} from 'lucide-react';
import { Character, PRESET_TAGS, CreatorRequest, ContactLink } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import { subscribeCreatorRequests, updateCreatorRequest, deleteCreatorRequest } from '../services/creatorRequestService';
import { SuggestedAvatar, subscribeSuggestedAvatars, addSuggestedAvatar, deleteSuggestedAvatar, clearAllSuggestedAvatars } from '../services/suggestedAvatarService';
import { WinterMailboxAdmin } from './WinterMailboxAdmin';
import { SecretLettersAdmin } from './SecretLettersAdmin';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onAddCharacter: (newChar: Omit<Character, 'id' | 'votes' | 'likes'>) => void;
  onEditCharacter: (char: Character) => void;
  onDeleteCharacter: (id: string) => void;
  onSendNotification?: (title: string, content: string, type?: 'announcement' | 'new_character', characterId?: string) => void;
  onSelectCharacter?: (char: Character) => void;
  onToast?: (msg: string) => void;
  onResetAllVotes?: () => void;
  onOpenCommandLibrary?: () => void;
  contacts?: ContactLink[];
  onSaveContact?: (contact: ContactLink) => Promise<void>;
  onDeleteContact?: (id: string) => Promise<void>;
  onReorderContacts?: (contacts: ContactLink[]) => Promise<void>;
  initialTab?: 'list' | 'create' | 'edit' | 'notify' | 'requests' | 'avatars' | 'contacts' | 'winterMailbox' | 'secretLetters';
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  characters,
  onAddCharacter,
  onEditCharacter,
  onDeleteCharacter,
  onSendNotification,
  onSelectCharacter,
  onToast,
  onResetAllVotes,
  onOpenCommandLibrary,
  contacts = [],
  onSaveContact,
  onDeleteContact,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit' | 'notify' | 'requests' | 'avatars' | 'contacts' | 'winterMailbox' | 'secretLetters'>('list');

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  const [editingContact, setEditingContact] = useState<ContactLink | null>(null);
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [contactLabel, setContactLabel] = useState('');
  const [contactValue, setContactValue] = useState('');
  const [contactDisplay, setContactDisplay] = useState('');
  const [contactIconType, setContactIconType] = useState<ContactLink['iconType']>('facebook');
  const [contactImageUrl, setContactImageUrl] = useState('');
  const contactFileInputRef = useRef<HTMLInputElement>(null);
  const [adminRequests, setAdminRequests] = useState<CreatorRequest[]>([]);
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending_approval' | 'approved' | 'responded' | 'needs_revision' | 'rejected'>('all');
  const [creatorReplyInputs, setCreatorReplyInputs] = useState<Record<string, string>>({});
  const [suggestedAvatars, setSuggestedAvatars] = useState<SuggestedAvatar[]>([]);
  const [avatarNameInput, setAvatarNameInput] = useState('');
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribeAvatars = subscribeSuggestedAvatars((avatars) => {
      setSuggestedAvatars(avatars);
    });
    const unsubscribeRequests = subscribeCreatorRequests((reqs) => {
      setAdminRequests(reqs);
    });
    return () => {
      unsubscribeAvatars();
      unsubscribeRequests();
    };
  }, []);

  const handleUploadAvatarFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await compressImageFile(file, 400, 400, 0.85);
        await addSuggestedAvatar({
          url: compressed,
          name: avatarNameInput.trim() || file.name.replace(/\.[^/.]+$/, ''),
          createdAt: new Date().toISOString(),
        });
      }
      setAvatarNameInput('');
      if (onToast) onToast('✨ Đã tải lên và đồng bộ avatar gợi ý cho toàn hệ thống!');
    } catch (err) {
      console.error(err);
      if (onToast) onToast('⚠️ Không thể tải ảnh lên');
    }
    if (e.target) e.target.value = '';
  };

  const handleContactImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 800, 800, 0.85);
        setContactImageUrl(compressed);
        if (onToast) onToast('✨ Đã đính kèm ảnh từ tệp thành công!');
      } catch (err) {
        console.warn('Contact image compression failed:', err);
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (evt.target?.result) {
            setContactImageUrl(evt.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleStartCreateContact = () => {
    setEditingContact(null);
    setIsCreatingContact(true);
    setContactLabel('');
    setContactValue('');
    setContactDisplay('');
    setContactIconType('facebook');
    setContactImageUrl('');
  };

  const handleStartEditContact = (c: ContactLink) => {
    setEditingContact(c);
    setIsCreatingContact(false);
    setContactLabel(c.label);
    setContactValue(c.value);
    setContactDisplay(c.display || '');
    setContactIconType(c.iconType || 'facebook');
    setContactImageUrl(c.imageUrl || '');
  };

  const handleSaveContactClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactLabel.trim() || !contactValue.trim()) {
      if (onToast) onToast('⚠️ Vui lòng nhập Tên nhãn và Đường link liên hệ!');
      return;
    }

    const newContact: ContactLink = {
      id: editingContact ? editingContact.id : 'contact_' + Date.now(),
      label: contactLabel.trim(),
      value: contactValue.trim(),
      display: contactDisplay.trim() || contactValue.trim(),
      iconType: contactIconType,
      imageUrl: contactImageUrl.trim(),
      displayOrder: editingContact ? editingContact.displayOrder : (contacts?.length || 0),
      createdAt: editingContact ? editingContact.createdAt : new Date().toISOString(),
    };

    if (onSaveContact) {
      await onSaveContact(newContact);
      if (onToast) onToast('💾 Đã lưu thông tin liên hệ thành công!');
    }

    setEditingContact(null);
    setIsCreatingContact(false);
    setContactLabel('');
    setContactValue('');
    setContactDisplay('');
    setContactIconType('facebook');
    setContactImageUrl('');
  };

  const [listFilter, setListFilter] = useState<'all' | 'published' | 'private' | 'draft'>('all');
  const [editingChar, setEditingChar] = useState<Character | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState(''); // Tagline
  const [formAvatar, setFormAvatar] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formChatUrl, setFormChatUrl] = useState('');
  const [formChatUrl2, setFormChatUrl2] = useState('');
  const [formChatUrlLabel, setFormChatUrlLabel] = useState('');
  const [formChatUrl2Label, setFormChatUrl2Label] = useState('');
  const [formCreator, setFormCreator] = useState('Yui');
  const [formNotes, setFormNotes] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formStory, setFormStory] = useState('');
  const [formFirstMessage, setFormFirstMessage] = useState('');
  const [formDecorativeItemSet, setFormDecorativeItemSet] = useState('♡ ୨୧ ♡');
  const [formStatus, setFormStatus] = useState<'public' | 'private' | 'draft'>('public');

  // Announcement Form State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifContent, setNotifContent] = useState('');
  const [notifSentSuccess, setNotifSentSuccess] = useState(false);


  // New custom tag state
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>(PRESET_TAGS);

  // Auto-Save Draft System State
  const DRAFT_STORAGE_KEY = 'yui_character_form_draft_autosave_v2';
  const [savedDraft, setSavedDraft] = useState<{
    name: string;
    title: string;
    avatar: string;
    tags: string[];
    chatUrl: string;
    chatUrl2?: string;
    chatUrlLabel?: string;
    chatUrl2Label?: string;
    creator: string;
    notes: string;
    password: string;
    story: string;
    firstMessage: string;
    decorativeItemSet: string;
    formStatus: 'public' | 'private' | 'draft';
    mode: 'create' | 'edit';
    editingCharId?: string;
    updatedAt: number;
    formattedTime: string;
  } | null>(null);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // In-app deletion confirmation states (replaces window.confirm for reliable iframe support)
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [isConfirmingResetVotes, setIsConfirmingResetVotes] = useState(false);

  // Check for existing auto-saved draft when opening admin or switching tabs
  useEffect(() => {
    if (isOpen) {
      try {
        const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (rawDraft) {
          const parsed = JSON.parse(rawDraft);
          if (parsed && (parsed.name || parsed.title || parsed.story || parsed.chatUrl || parsed.firstMessage)) {
            setSavedDraft(parsed);
          }
        }
      } catch (err) {
        console.warn('Could not read auto-save draft:', err);
      }
    }
  }, [isOpen, activeTab]);

  // Continuous Auto-Save effect: Runs whenever user edits any field
  useEffect(() => {
    if (!isOpen || (activeTab !== 'create' && activeTab !== 'edit')) return;

    const hasContent =
      formName.trim() ||
      formTitle.trim() ||
      formStory.trim() ||
      formChatUrl.trim() ||
      formChatUrl2.trim() ||
      formFirstMessage.trim() ||
      formNotes.trim() ||
      formAvatar.trim();

    if (!hasContent) return;

    const timer = setTimeout(() => {
      try {
        setIsAutoSaving(true);
        const now = new Date();
        const formatted = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const draftPayload = {
          name: formName,
          title: formTitle,
          avatar: formAvatar,
          tags: formTags,
          chatUrl: formChatUrl,
          chatUrl2: formChatUrl2,
          chatUrlLabel: formChatUrlLabel,
          chatUrl2Label: formChatUrl2Label,
          creator: formCreator,
          notes: formNotes,
          password: formPassword,
          story: formStory,
          firstMessage: formFirstMessage,
          decorativeItemSet: formDecorativeItemSet,
          formStatus,
          mode: activeTab,
          editingCharId: editingChar?.id,
          updatedAt: Date.now(),
          formattedTime: formatted,
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
        setLastAutoSaveTime(formatted);
        setTimeout(() => setIsAutoSaving(false), 250);
      } catch (err) {
        console.warn('Auto-save draft error:', err);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [
    isOpen,
    activeTab,
    formName,
    formTitle,
    formAvatar,
    formTags,
    formChatUrl,
    formChatUrl2,
    formChatUrlLabel,
    formChatUrl2Label,
    formCreator,
    formNotes,
    formPassword,
    formStory,
    formFirstMessage,
    formDecorativeItemSet,
    formStatus,
    editingChar,
  ]);

  // BeforeUnload & Offline drop protection
  useEffect(() => {
    const handleBeforeUnload = () => {
      const hasContent = formName.trim() || formTitle.trim() || formStory.trim() || formChatUrl.trim() || formChatUrl2.trim();
      if (hasContent && (activeTab === 'create' || activeTab === 'edit')) {
        const now = new Date();
        const formatted = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const draftPayload = {
          name: formName,
          title: formTitle,
          avatar: formAvatar,
          tags: formTags,
          chatUrl: formChatUrl,
          chatUrl2: formChatUrl2,
          chatUrlLabel: formChatUrlLabel,
          chatUrl2Label: formChatUrl2Label,
          creator: formCreator,
          notes: formNotes,
          password: formPassword,
          story: formStory,
          firstMessage: formFirstMessage,
          decorativeItemSet: formDecorativeItemSet,
          formStatus,
          mode: activeTab,
          editingCharId: editingChar?.id,
          updatedAt: Date.now(),
          formattedTime: formatted,
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [
    formName,
    formTitle,
    formAvatar,
    formTags,
    formChatUrl,
    formChatUrl2,
    formChatUrlLabel,
    formChatUrl2Label,
    formCreator,
    formNotes,
    formPassword,
    formStory,
    formFirstMessage,
    formDecorativeItemSet,
    formStatus,
    activeTab,
    editingChar,
  ]);

  const handleRestoreDraft = () => {
    if (!savedDraft) return;
    setFormName(savedDraft.name || '');
    setFormTitle(savedDraft.title || '');
    setFormAvatar(savedDraft.avatar || '');
    setFormTags(savedDraft.tags || []);
    setFormChatUrl(savedDraft.chatUrl || '');
    setFormChatUrl2(savedDraft.chatUrl2 || '');
    setFormChatUrlLabel(savedDraft.chatUrlLabel || '');
    setFormChatUrl2Label(savedDraft.chatUrl2Label || '');
    setFormCreator(savedDraft.creator || 'Yui');
    setFormNotes(savedDraft.notes || '');
    setFormPassword(savedDraft.password || '');
    setFormStory(savedDraft.story || '');
    setFormFirstMessage(savedDraft.firstMessage || '');
    setFormDecorativeItemSet(savedDraft.decorativeItemSet || '♡ ୨୧ ♡');
    setFormStatus(savedDraft.formStatus || 'draft');

    if (savedDraft.mode === 'edit' && savedDraft.editingCharId) {
      const target = characters.find((c) => c.id === savedDraft.editingCharId);
      if (target) {
        setEditingChar(target);
        setActiveTab('edit');
      }
    } else {
      setActiveTab('create');
    }

    if (onToast) onToast('✨ Đã khôi phục bản nháp đang viết dở thành công!');
    setSavedDraft(null);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setSavedDraft(null);
    if (onToast) onToast('🗑️ Đã xóa bản nháp tự động lưu.');
  };

  const resetForm = () => {
    setFormName('');
    setFormTitle('');
    setFormAvatar('');
    setFormTags([]);
    setFormChatUrl('');
    setFormChatUrl2('');
    setFormChatUrlLabel('');
    setFormChatUrl2Label('');
    setFormCreator('Yui');
    setFormNotes('');
    setFormPassword('');
    setFormStory('');
    setFormFirstMessage('');
    setFormDecorativeItemSet('♡ ୨୧ ♡');
    setFormStatus('public');
    setEditingChar(null);
    setLastAutoSaveTime('');
  };

  const handleStartCreate = () => {
    resetForm();
    setActiveTab('create');
  };

  const handleStartEdit = (char: Character) => {
    setEditingChar(char);
    setFormName(char.name);
    setFormTitle(char.title);
    setFormAvatar(char.avatar);
    setFormTags(char.tags);
    setFormChatUrl(char.chatUrl);
    setFormChatUrl2(char.chatUrl2 || '');
    setFormChatUrlLabel(char.chatUrlLabel || '');
    setFormChatUrl2Label(char.chatUrl2Label || '');
    setFormCreator(char.creator || 'Yui');
    setFormNotes(char.notes || '');
    setFormPassword(char.password || '');
    setFormStory(char.story || '');
    setFormFirstMessage(char.firstMessage || '');
    setFormDecorativeItemSet(char.decorativeItemSet || '♡ ୨୧ ♡');
    
    if (char.isDraft) {
      setFormStatus('draft');
    } else if (char.isPrivate) {
      setFormStatus('private');
    } else {
      setFormStatus('public');
    }

    setActiveTab('edit');
  };

  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingAvatar(true);
        let compressed = await compressImageFile(file, 600, 600, 0.82);
        if (compressed.length > 700000) {
          compressed = await compressImageFile(file, 450, 450, 0.72);
        }
        if (compressed.length > 850000) {
          if (onToast) onToast('⚠️ Ảnh quá nặng để đồng bộ Cloud, vui lòng chọn ảnh nhẹ hơn hoặc dùng URL.');
          return;
        }
        setFormAvatar(compressed);
        if (onToast) onToast('✨ Ảnh avatar đã được tối ưu hóa chuẩn Cloud!');
      } catch (err) {
        console.warn('Compression failed, using standard reader:', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result;
          if (typeof result === 'string') {
            if (result.length > 850000) {
              if (onToast) onToast('⚠️ Ảnh quá lớn (>850KB), vui lòng chọn ảnh nhẹ hơn hoặc dán URL.');
              return;
            }
            setFormAvatar(result);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressingAvatar(false);
      }
    }
  };

  const handleToggleTag = (tag: string) => {
    if (formTags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setFormTags(formTags.filter((t) => t.toLowerCase() !== tag.toLowerCase()));
    } else {
      setFormTags([...formTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags((prev) => prev.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()));
  };

  const handleDeleteAvailableTag = (tagToDelete: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAvailableTags((prev) => prev.filter((t) => t.toLowerCase() !== tagToDelete.toLowerCase()));
    setFormTags((prev) => prev.filter((t) => t.toLowerCase() !== tagToDelete.toLowerCase()));
  };

  const handleAddCustomTag = () => {
    if (newTagInput.trim()) {
      const tagClean = newTagInput.trim();
      if (!availableTags.some((t) => t.toLowerCase() === tagClean.toLowerCase())) {
        setAvailableTags([...availableTags, tagClean]);
      }
      if (!formTags.some((t) => t.toLowerCase() === tagClean.toLowerCase())) {
        setFormTags([...formTags, tagClean]);
      }
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleSave = (targetStatus?: 'public' | 'private' | 'draft') => {
    const primaryUrl = formChatUrl.trim() || formChatUrl2.trim();
    if (!formName.trim() || !primaryUrl) {
      if (onToast) onToast('⚠️ Vui lòng nhập Tên nhân vật và ít nhất 1 đường link trò chuyện!');
      return;
    }

    if (formAvatar && formAvatar.length > 880000) {
      if (onToast) onToast('⚠️ Ảnh avatar vượt quá giới hạn đồng bộ Cloud (~880KB). Vui lòng tải lại ảnh nhỏ hơn hoặc dán URL!');
      return;
    }

    const finalStatus = targetStatus || formStatus;
    const isDraft = finalStatus === 'draft';
    const isPrivate = finalStatus === 'private';

    const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600';
    const finalChatUrl = formChatUrl.trim() || formChatUrl2.trim();
    const finalChatUrl2 = formChatUrl.trim() && formChatUrl2.trim() ? formChatUrl2.trim() : (formChatUrl2.trim() && !formChatUrl.trim() ? undefined : (formChatUrl2.trim() || undefined));
    const finalChatUrlLabel = formChatUrlLabel.trim() || undefined;
    const finalChatUrl2Label = formChatUrl2Label.trim() || undefined;

    if (activeTab === 'create') {
      onAddCharacter({
        name: formName,
        title: formTitle || 'Character AI độc quyền',
        avatar: formAvatar || defaultAvatar,
        tags: formTags.length > 0 ? formTags : ['Hiện đại', 'Chữa lành'],
        chatUrl: finalChatUrl,
        chatUrl2: finalChatUrl2,
        chatUrlLabel: finalChatUrlLabel,
        chatUrl2Label: finalChatUrl2Label,
        creator: formCreator || 'Yui',
        notes: formNotes.trim(),
        password: formPassword.trim(),
        story: formStory.trim(),
        firstMessage: formFirstMessage.trim(),
        decorativeItemSet: formDecorativeItemSet,
        isDraft,
        isPrivate,
      });

      // If published publicly, create a notification for users
      if (finalStatus === 'public' && onSendNotification) {
        onSendNotification(
          `Vừa đăng character mới: ${formName}!`,
          `Ghé thăm góc nhỏ để trò chuyện cùng ${formName} ngay nhé!`,
          'new_character'
        );
      }
    } else if (activeTab === 'edit' && editingChar) {
      onEditCharacter({
        ...editingChar,
        name: formName,
        title: formTitle,
        avatar: formAvatar || defaultAvatar,
        tags: formTags,
        chatUrl: finalChatUrl,
        chatUrl2: finalChatUrl2,
        chatUrlLabel: finalChatUrlLabel,
        chatUrl2Label: finalChatUrl2Label,
        creator: formCreator || 'Yui',
        notes: formNotes.trim(),
        password: formPassword.trim(),
        story: formStory.trim(),
        firstMessage: formFirstMessage.trim(),
        decorativeItemSet: formDecorativeItemSet,
        isDraft,
        isPrivate,
      });

      // Notification when changing status to public
      if ((editingChar.isDraft || editingChar.isPrivate) && finalStatus === 'public' && onSendNotification) {
        onSendNotification(
          `Cập nhật: ${formName} đã được công khai!`,
          `Character ${formName} hiện đã sẵn sàng để tất cả mọi người cùng tương tác.`,
          'new_character',
          editingChar.id
        );
      }
    }

    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setSavedDraft(null);
    } catch (e) {
      console.warn('Clear draft notice:', e);
    }

    resetForm();
    setActiveTab('list');
  };

  const handleQuickSaveDraft = () => {
    if (!formName.trim()) {
      if (onToast) onToast('⚠️ Vui lòng nhập ít nhất Tên nhân vật để lưu vào danh sách Bản nháp!');
      return;
    }

    const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600';
    const finalChatUrl = formChatUrl.trim() || formChatUrl2.trim() || 'https://ggai.me';
    const finalChatUrl2 = formChatUrl2.trim() || undefined;
    const finalChatUrlLabel = formChatUrlLabel.trim() || undefined;
    const finalChatUrl2Label = formChatUrl2Label.trim() || undefined;

    if (activeTab === 'create') {
      onAddCharacter({
        name: formName.trim(),
        title: formTitle.trim() || 'Bản nháp đang viết dở...',
        avatar: formAvatar || defaultAvatar,
        tags: formTags.length > 0 ? formTags : ['Bản nháp'],
        chatUrl: finalChatUrl,
        chatUrl2: finalChatUrl2,
        chatUrlLabel: finalChatUrlLabel,
        chatUrl2Label: finalChatUrl2Label,
        creator: formCreator || 'Yui',
        notes: formNotes.trim(),
        password: formPassword.trim(),
        story: formStory.trim(),
        firstMessage: formFirstMessage.trim(),
        decorativeItemSet: formDecorativeItemSet,
        isDraft: true,
        isPrivate: false,
      });
      if (onToast) onToast('💾 Đã lưu nhân vật vào danh sách Bản nháp hệ thống!');
    } else if (activeTab === 'edit' && editingChar) {
      onEditCharacter({
        ...editingChar,
        name: formName.trim(),
        title: formTitle.trim() || 'Bản nháp đang viết dở...',
        avatar: formAvatar || defaultAvatar,
        tags: formTags.length > 0 ? formTags : ['Bản nháp'],
        chatUrl: finalChatUrl,
        chatUrl2: finalChatUrl2,
        chatUrlLabel: finalChatUrlLabel,
        chatUrl2Label: finalChatUrl2Label,
        creator: formCreator || 'Yui',
        notes: formNotes.trim(),
        password: formPassword.trim(),
        story: formStory.trim(),
        firstMessage: formFirstMessage.trim(),
        decorativeItemSet: formDecorativeItemSet,
        isDraft: true,
        isPrivate: false,
      });
      if (onToast) onToast('💾 Đã cập nhật bản nháp vào hệ thống!');
    }

    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setSavedDraft(null);
    } catch (e) {
      console.warn('Clear draft notice:', e);
    }

    resetForm();
    setActiveTab('list');
  };

  const handleCycleStatus = (char: Character) => {
    let nextDraft = false;
    let nextPrivate = false;

    if (!char.isDraft && !char.isPrivate) {
      // Public -> Private
      nextDraft = false;
      nextPrivate = true;
    } else if (char.isPrivate) {
      // Private -> Draft
      nextDraft = true;
      nextPrivate = false;
    } else {
      // Draft -> Public
      nextDraft = false;
      nextPrivate = false;
    }

    onEditCharacter({
      ...char,
      isDraft: nextDraft,
      isPrivate: nextPrivate,
    });
  };

  const handleSendAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifContent.trim()) return;

    if (onSendNotification) {
      onSendNotification(notifTitle.trim(), notifContent.trim(), 'announcement');
      setNotifTitle('');
      setNotifContent('');
      setNotifSentSuccess(true);
      setTimeout(() => setNotifSentSuccess(false), 2500);
    }
  };

  const handleCopyCharactersCode = async () => {
    const codeSnippet = `import { Character } from '../types';\n\nexport const INITIAL_CHARACTERS: Character[] = ${JSON.stringify(characters, null, 2)};\n`;
    try {
      await navigator.clipboard.writeText(codeSnippet);
      if (onToast) onToast('📋 Đã sao chép mã characters.ts mới nhất vào bộ nhớ tạm!');
    } catch (err) {
      const blob = new Blob([codeSnippet], { type: 'text/typescript;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'characters.ts';
      a.click();
      URL.revokeObjectURL(url);
      if (onToast) onToast('💾 Đã tải xuống tệp characters.ts mới nhất!');
    }
  };

  const filteredList = characters.filter((c) => {
    if (listFilter === 'published') return !c.isDraft && !c.isPrivate;
    if (listFilter === 'private') return !!c.isPrivate;
    if (listFilter === 'draft') return !!c.isDraft;
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#122033]/75 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#F7FAFE] dark:bg-[#172536] rounded-[28px] shadow-2xl border border-[#CFE1F2] dark:border-[#39506B] text-[#16273B] dark:text-[#E5EDF5] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE9F5] dark:border-[#334963] bg-gradient-to-r from-white via-[#F4F9FF] to-[#E6F1FC] dark:from-[#1B2B40] dark:to-[#172536]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#EAF3FC] dark:bg-[#23374F] text-[#4E7AA5] dark:text-[#A8CDF0] border border-[#CFE1F2] dark:border-[#39506B]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-[#16273B] dark:text-white flex items-center gap-2">
                    <span>Quản lý &amp; Sáng tạo</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] text-white font-semibold font-sans">
                      Yui Studio
                    </span>
                  </h3>
                  <p className="text-xs text-[#5E7C99] dark:text-[#A4C0DA] font-serif">
                    Đăng tải nhân vật, duyệt Request, quản lý hộp thư &amp; phát tin lên đầu trang
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-[#64829E] hover:text-[#16273B] dark:hover:text-white rounded-full hover:bg-[#EAF3FC] dark:hover:bg-[#243750] transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 border-b border-[#DCE9F5] dark:border-[#334963] bg-[#EDF5FD]/70 dark:bg-[#1C2C41]/70">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'list'
                      ? 'bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] text-white shadow-sm'
                      : 'bg-white dark:bg-[#23374F] text-[#36597A] dark:text-[#CFE1F2] border border-[#DCE9F5] dark:border-[#39506B] hover:bg-[#EAF3FC]'
                  }`}
                >
                  Danh sách ({characters.length})
                </button>

                <button
                  onClick={handleStartCreate}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    activeTab === 'create'
                      ? 'bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] text-white shadow-sm'
                      : 'bg-white dark:bg-[#23374F] text-[#36597A] dark:text-[#CFE1F2] border border-[#DCE9F5] dark:border-[#39506B] hover:bg-[#EAF3FC]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm mới</span>
                </button>

                <button
                  onClick={() => setActiveTab('notify')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    activeTab === 'notify'
                      ? 'bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] text-white shadow-sm'
                      : 'bg-white dark:bg-[#23374F] text-[#36597A] dark:text-[#CFE1F2] border border-[#DCE9F5] dark:border-[#39506B] hover:bg-[#EAF3FC]'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Tạo Thông Báo</span>
                </button>

                <button
                  onClick={() => setActiveTab('requests')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors relative cursor-pointer ${
                    activeTab === 'requests'
                      ? 'bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] text-white shadow-sm'
                      : 'bg-white dark:bg-[#23374F] text-[#36597A] dark:text-[#CFE1F2] border border-[#DCE9F5] dark:border-[#39506B] hover:bg-[#EAF3FC]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Đơn Request</span>
                  {adminRequests.filter((r) => r.status === 'pending_approval').length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-md bg-[#21334A] text-white text-[9px] font-bold">
                      {adminRequests.filter((r) => r.status === 'pending_approval').length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('avatars')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'avatars'
                      ? 'bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] text-white shadow-sm'
                      : 'bg-white dark:bg-[#23374F] text-[#36597A] dark:text-[#CFE1F2] border border-[#DCE9F5] dark:border-[#39506B] hover:bg-[#EAF3FC]'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Avatar Gợi Ý</span>
                </button>

                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'contacts'
                      ? 'bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] text-white shadow-sm'
                      : 'bg-white dark:bg-[#23374F] text-[#36597A] dark:text-[#CFE1F2] border border-[#DCE9F5] dark:border-[#39506B] hover:bg-[#EAF3FC]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Liên Hệ</span>
                </button>

                <button
                  onClick={() => setActiveTab('winterMailbox')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'winterMailbox'
                      ? 'bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] text-white shadow-sm'
                      : 'bg-white dark:bg-[#23374F] text-[#36597A] dark:text-[#CFE1F2] border border-[#DCE9F5] dark:border-[#39506B] hover:bg-[#EAF3FC]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Hòm Thư Mùa Đông</span>
                </button>

                <button
                  onClick={() => setActiveTab('secretLetters')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'secretLetters'
                      ? 'bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] text-white shadow-sm'
                      : 'bg-white dark:bg-[#23374F] text-[#36597A] dark:text-[#CFE1F2] border border-[#DCE9F5] dark:border-[#39506B] hover:bg-[#EAF3FC]'
                  }`}
                >
                  <Feather className="w-3.5 h-3.5" />
                  <span>Tâm Thư Đêm Tuyết</span>
                </button>

                {onOpenCommandLibrary && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCommandLibrary();
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all bg-[#EAF3FC] dark:bg-[#23374F] text-[#36597A] dark:text-[#A8CDF0] border border-[#BFD8EE] dark:border-[#49698C] hover:bg-[#4E7AA5] hover:text-white cursor-pointer"
                    title="Mở Kho Lệnh để Đăng, Sửa, Sắp xếp và Quản lý Lệnh"
                  >
                    <Snowflake className="w-3.5 h-3.5" />
                    <span>Kho Lệnh</span>
                  </button>
                )}
              </div>

              {activeTab === 'list' && (
                <div className="flex flex-wrap items-center justify-between gap-2 w-full pt-1">
                  <div className="flex items-center gap-1 bg-white dark:bg-[#202F42] p-1 rounded-xl border border-[#DCE9F5] dark:border-[#39506B] text-[11px] font-medium">
                    <button
                      onClick={() => setListFilter('all')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        listFilter === 'all' ? 'bg-[#4E7AA5] text-white font-bold shadow-xs' : 'text-[#5E7C99] dark:text-[#A4C0DA]'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setListFilter('published')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        listFilter === 'published' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-[#5E7C99] dark:text-[#A4C0DA]'
                      }`}
                    >
                      Công khai
                    </button>
                    <button
                      onClick={() => setListFilter('private')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        listFilter === 'private' ? 'bg-[#36597A] text-white font-bold shadow-xs' : 'text-[#5E7C99] dark:text-[#A4C0DA]'
                      }`}
                    >
                      Riêng tư
                    </button>
                    <button
                      onClick={() => setListFilter('draft')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        listFilter === 'draft' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-[#5E7C99] dark:text-[#A4C0DA]'
                      }`}
                    >
                      Bản nháp
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5"
                      title="Mọi nhân vật, thông báo và liên hệ đăng tại đây đều tự động cập nhật trực tiếp lên Cloud cho mọi người đọc"
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      <span>Tự động đồng bộ dữ liệu Cloud</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleCopyCharactersCode}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#EAF3FC] dark:bg-[#23374F] text-[#4E7AA5] dark:text-[#A8CDF0] border border-[#CFE1F2] dark:border-[#39506B] flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Sao chép mã TypeScript (characters.ts) từ dữ liệu đang có"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép code dữ liệu</span>
                    </button>

                    {onResetAllVotes && (
                      <button
                        onClick={() => setIsConfirmingResetVotes(true)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#EAF3FC] dark:bg-[#23374F] text-[#4E7AA5] dark:text-[#A8CDF0] border border-[#CFE1F2] dark:border-[#39506B] flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Đặt lại 0 tim cho tất cả nhân vật"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Đặt lại 0 tim tất cả</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              
              {/* Tab 1: Character List Table */}
              {activeTab === 'list' && (
                <div className="space-y-3">
                  {filteredList.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 dark:text-slate-400 font-medium text-base">
                      Ơ, không có rồi.
                    </div>
                  ) : (
                    filteredList.map((char) => (
                      <div
                        key={char.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={char.avatar}
                            alt={char.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {char.name}
                              </h5>
                              {char.isDraft ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-300/60 dark:border-amber-900/50 flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  <span>Bản nháp</span>
                                </span>
                              ) : char.isPrivate ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-300/60 dark:border-purple-900/50 flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  <span>Riêng tư</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300/60 dark:border-emerald-900/50 flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  <span>Công khai</span>
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EAF3FC] dark:bg-[#23374F] text-[#4E7AA5] dark:text-[#A8CDF0] border border-[#CFE1F2] dark:border-[#39506B] flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                <span>{char.votes || 0} tim</span>
                              </span>
                              {char.chatUrl2 && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] border border-[#DCE7EF] dark:border-[#43576B] flex items-center gap-1" title="Nhân vật có 2 link trò chuyện">
                                  <span>2 link</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#4E7AA5] dark:text-[#9EC5EC] font-medium">
                              Tác giả: {char.creator || 'Yui'}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {char.tags.map(t => `#${t}`).join(' ')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* View detail button */}
                          {onSelectCharacter && (
                            <button
                              onClick={() => onSelectCharacter(char)}
                              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                              title="Xem chi tiết nhân vật"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleCycleStatus(char)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                              char.isDraft
                                ? 'bg-sky-500 text-white hover:bg-sky-600'
                                : char.isPrivate
                                ? 'bg-[#36597A] text-white hover:bg-[#2A4661]'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                            title="Đổi trạng thái (Công khai -> Riêng tư -> Bản nháp)"
                          >
                            {char.isDraft ? (
                              <>
                                <FileText className="w-3.5 h-3.5" />
                                <span>Nháp</span>
                              </>
                            ) : char.isPrivate ? (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Riêng tư</span>
                              </>
                            ) : (
                              <>
                                <Globe className="w-3.5 h-3.5" />
                                <span>Công khai</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleStartEdit(char)}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                            title="Sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setCharacterToDelete(char)}
                            className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                            title="Xóa nhân vật"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2 & 3: Create / Edit Form */}
              {(activeTab === 'create' || activeTab === 'edit') && (
                <div className="space-y-4">
                  {/* Auto-Saved Draft Restore Banner */}
                  {savedDraft && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-amber-500/10 border border-amber-300 dark:border-amber-700/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 min-w-0">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        <div className="truncate">
                          <span className="font-bold">Tìm thấy bản nháp tự lưu lúc {savedDraft.formattedTime || 'trước đó'}:</span>{' '}
                          <span className="italic font-medium text-amber-900 dark:text-amber-100">
                            "{savedDraft.name || 'Nhân vật chưa đặt tên'}"
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleRestoreDraft}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-[11px] shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Khôi phục nội dung</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDiscardDraft}
                          className="px-2.5 py-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl text-[11px] transition-colors cursor-pointer"
                        >
                          Bỏ qua
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeTab === 'create' ? 'Tạo nhân vật mới' : `Chỉnh sửa: ${editingChar?.name}`}
                    </h4>
                    {lastAutoSaveTime && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <span className={`w-2 h-2 rounded-full ${isAutoSaving ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
                        <span>{isAutoSaving ? 'Đang lưu nháp...' : `Đã tự lưu lúc ${lastAutoSaveTime}`}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Tên Nhân Vật *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName || ''}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Nhập tên nhân vật..."
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Tác giả
                      </label>
                      <input
                        type="text"
                        value={formCreator || ''}
                        onChange={(e) => setFormCreator(e.target.value)}
                        placeholder="Nhập tên tác giả (Mặc định: Yui)..."
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Tagline / Short description textarea */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Tagline / Mô tả ngắn *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formTitle || ''}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Nhập mô tả ngắn cho nhân vật (có thể xuống dòng thoải mái)..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white leading-relaxed resize-none"
                    />
                  </div>

                  {/* Ghi chú field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      <span>Ghi chú của Tác giả (Ghi chú thêm về tính cách, bối cảnh, nhắc nhở...)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formNotes || ''}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Nhập ghi chú cho nhân vật (có thể xuống dòng thoải mái)..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white leading-relaxed resize-none"
                    />
                  </div>

                  {/* Mật khẩu truy cập (Passcode) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-purple-500" />
                      <span>Mật khẩu bảo vệ (Tùy chọn)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? 'text' : 'password'}
                        value={formPassword || ''}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="Nhập mật khẩu nếu muốn cài pass (Để trống nếu không cài pass)..."
                        className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-purple-500 transition-colors cursor-pointer"
                        title={showFormPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showFormPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      * Nếu cài mật khẩu, người dùng bắt buộc phải nhập đúng pass mới có thể xem chi tiết hoặc tương tác với nhân vật.
                    </p>
                  </div>

                  {/* Cốt truyện / STORY */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold text-[#36597A] dark:text-[#A8CDF0]">
                        STORY (Cốt truyện / Bối cảnh nhân vật)
                      </span>
                      <span className="text-[10px] text-slate-400">Tùy chọn</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formStory || ''}
                      onChange={(e) => setFormStory(e.target.value)}
                      placeholder="Nhập nội dung STORY/Cốt truyện của nhân vật... (Có thể xuống dòng hoặc chia thành các đoạn văn)..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-[#CFE1F2] dark:border-[#39506B] text-xs text-slate-900 dark:text-white leading-relaxed resize-y"
                    />
                  </div>

                  {/* Tin nhắn đầu tiên / FIRST MESSAGE */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold text-[#36597A] dark:text-[#A8CDF0]">
                        FIRST MESSAGE (Tin nhắn mở đầu câu chuyện)
                      </span>
                      <span className="text-[10px] text-slate-400">Tùy chọn</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formFirstMessage || ''}
                      onChange={(e) => setFormFirstMessage(e.target.value)}
                      placeholder="Nhập lời mở đầu/tin nhắn đầu tiên của nhân vật... (Giao diện hiển thị trong khung đọc riêng biệt)..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-[#CFE1F2] dark:border-[#39506B] text-xs text-slate-900 dark:text-white leading-relaxed resize-y"
                    />
                  </div>

                  {/* Bộ Item trang trí theo Character */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      ❄️ Bộ Ký Tự Trang Trí Đọc Truyện (Mặc định: ♡ ୨୧ ♡)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'Ngọt Ngào', val: '♡ ୨୧ ♡' },
                        { label: 'Ánh Kim', val: '✦ ── ✦' },
                        { label: 'Mềm Mại', val: '˚₊‧ ୨୧ ‧₊˚' },
                        { label: 'Thiên Thần', val: '꒰ა ♡ ໒꒱' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setFormDecorativeItemSet(item.val)}
                          className={`p-2 rounded-xl text-xs border text-center transition-all cursor-pointer ${
                            formDecorativeItemSet === item.val
                              ? 'bg-[#EAF3FC] dark:bg-[#23374F] border-[#4E7AA5] text-[#21334A] dark:text-[#CBE0F5] font-bold shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <div className="text-[11px] font-medium">{item.label}</div>
                          <div className="text-xs mt-0.5">{item.val}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Picker: Public vs Private vs Draft */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <label className="block text-xs font-bold text-slate-900 dark:text-white">
                      Trạng thái xuất bản nhân vật
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormStatus('public')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          formStatus === 'public'
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Công khai</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormStatus('private')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          formStatus === 'private'
                            ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Riêng tư</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormStatus('draft')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          formStatus === 'draft'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Lưu nháp</span>
                      </button>
                    </div>
                  </div>

                  {/* Avatar Upload (Local file or URL) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Avatar Nhân vật
                    </label>
                    <div className="flex items-center gap-3">
                      {formAvatar && (
                        <img
                          src={formAvatar}
                          alt="Avatar preview"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      )}
                      <div className="flex-1 space-y-1.5">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] text-white text-xs font-medium cursor-pointer hover:brightness-105 transition-all shadow-sm">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isCompressingAvatar ? 'Đang tải...' : 'Tải ảnh từ tệp máy'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFileUpload}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="url"
                          value={formAvatar || ''}
                          onChange={(e) => setFormAvatar(e.target.value)}
                          placeholder="Hoặc dán URL ảnh trực tiếp..."
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 🔗 Liên kết trò chuyện (Hỗ trợ 2 link) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#4E7AA5]" />
                        <span>Đường link trò chuyện / Ggai (Có thể dán 1 hoặc 2 link)</span>
                      </label>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#A9BDCE] font-semibold">
                        ❄️ Hỗ trợ 2 link
                      </span>
                    </div>

                    {/* Link 1 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#36597A] dark:text-[#A8CDF0] flex items-center gap-1">
                          <span>✦ Link 1 (Chính) *</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Ví dụ: Link Ggai chính</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            type="url"
                            required={!formChatUrl2}
                            value={formChatUrl || ''}
                            onChange={(e) => setFormChatUrl(e.target.value)}
                            placeholder="Nhập URL liên kết chat 1 (https://...)..."
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#91A9BC]/40"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={formChatUrlLabel || ''}
                            onChange={(e) => setFormChatUrlLabel(e.target.value)}
                            placeholder="Tên nút (Mặc định: Tiến tới Ggai)"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#91A9BC]/40"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Link 2 */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200/70 dark:border-slate-700/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#526B80] dark:text-[#A9BDCE] flex items-center gap-1">
                          <span>✧ Link 2 (Tùy chọn - Dự phòng / Link thứ 2)</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Không bắt buộc</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            type="url"
                            value={formChatUrl2 || ''}
                            onChange={(e) => setFormChatUrl2(e.target.value)}
                            placeholder="Nhập URL liên kết chat 2 (https://... - để trống nếu chỉ dùng 1 link)..."
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#91A9BC]/40"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={formChatUrl2Label || ''}
                            onChange={(e) => setFormChatUrl2Label(e.target.value)}
                            placeholder="Tên nút 2 (Mặc định: Link 2)"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#91A9BC]/40"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preset & Custom Tags Selection */}
                  <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#4E7AA5]" />
                        <span>Thẻ Tag / Thể loại nhân vật</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingTag(!isAddingTag)}
                        className="text-[11px] font-semibold text-[#4E7AA5] dark:text-[#A8CDF0] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm thẻ mới</span>
                      </button>
                    </div>

                    {isAddingTag && (
                      <div className="flex items-center gap-2 pt-1 pb-1">
                        <input
                          type="text"
                          value={newTagInput || ''}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                          placeholder="Nhập tên thẻ mới..."
                          className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-[#CFE1F2] dark:border-[#39506B] rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomTag}
                          className="px-3 py-1.5 bg-[#4E7AA5] hover:bg-[#36597A] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Thêm
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingTag(false)}
                          className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Active tags on character with instant delete buttons */}
                    {formTags.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Thẻ đang chọn cho nhân vật (Nhấn ✕ để gỡ bỏ):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {formTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-[#4E7AA5] text-white shadow-xs"
                            >
                              <span>#{tag}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="p-0.5 rounded-md hover:bg-white/20 transition-colors cursor-pointer"
                                title="Gỡ thẻ này khỏi nhân vật"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available tags palette with selection and deletion */}
                    <div className="space-y-1 pt-1">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Danh sách thẻ sẵn có (Nhấp để bật/tắt):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {availableTags.map((tag) => {
                          const isSelected = formTags.some((t) => t.toLowerCase() === tag.toLowerCase());
                          return (
                            <div
                              key={tag}
                              className={`inline-flex items-center rounded-xl text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-[#EAF3FC] dark:bg-[#23374F] text-[#36597A] dark:text-[#A8CDF0] border border-[#9EC3E6] dark:border-[#49698C]'
                                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleToggleTag(tag)}
                                className="px-2.5 py-1 text-xs cursor-pointer flex items-center gap-1"
                              >
                                <span>#{tag}</span>
                                {isSelected && <Check className="w-3 h-3 text-[#4E7AA5]" />}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteAvailableTag(tag, e)}
                                title={`Xóa vĩnh viễn thẻ '${tag}' khỏi danh sách`}
                                className="pr-2 pl-0.5 py-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span>Tự động lưu liên tục — Yên tâm tắt trình duyệt hay rớt mạng</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setActiveTab('list');
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        Đóng
                      </button>

                      <button
                        type="button"
                        onClick={handleQuickSaveDraft}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#EAF3FC] dark:bg-[#23374F] hover:bg-[#DCEBFA] text-[#36597A] dark:text-[#CBE0F5] border border-[#CFE1F2] dark:border-[#39506B] shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Lưu ngay vào danh sách Bản nháp hệ thống để viết tiếp sau"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#4E7AA5]" />
                        <span>Lưu vào Bản nháp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSave()}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] hover:brightness-105 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{formStatus === 'public' ? 'Đăng tải công khai' : formStatus === 'private' ? 'Lưu riêng tư' : 'Lưu bản nháp'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Send Notification Tab */}
              {activeTab === 'notify' && (
                <form onSubmit={handleSendAnnouncementSubmit} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#EAF3FC] dark:bg-[#1E2F44] border border-[#CFE1F2] dark:border-[#39506B] flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-tr from-[#6392BE] to-[#4E7AA5] text-white shrink-0">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-serif text-[#16273B] dark:text-white">
                        Đăng Tin Mới Lên Đầu Trang Chủ
                      </h4>
                      <p className="text-xs text-[#4C6B8A] dark:text-[#A4C0DA] mt-0.5 leading-relaxed">
                        Thông báo này sẽ xuất hiện tại <strong>Góc Cập Nhật Mới của Yui ở đầu trang chủ</strong>. Khi người đọc đã bấm xem &amp; đóng tin này, lần sau tải lại trang sẽ không hiển thị lại tin đó nữa cho tới khi Yui đăng tin mới hơn.
                      </p>
                    </div>
                  </div>

                  {notifSentSuccess && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center">
                      ✓ Đã phát thông báo lên đầu trang chủ thành công!
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Tiêu đề thông báo *
                    </label>
                    <input
                      type="text"
                      required
                      value={notifTitle || ''}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      placeholder="VD: Thông báo cập nhật nhân vật tuần này..."
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 rounded-xl border border-[#DCE9F5] dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Nội dung thông báo *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={notifContent || ''}
                      onChange={(e) => setNotifContent(e.target.value)}
                      placeholder="Viết nội dung cập nhật hoặc nhắn gửi..."
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 rounded-xl border border-[#DCE9F5] dark:border-slate-700 text-xs text-slate-900 dark:text-white leading-relaxed resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] hover:brightness-105 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Phát thông báo lên đầu trang</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tab: Creator Requests Management */}
              {activeTab === 'requests' && (
                <div className="space-y-6">
                  {/* Header & Filter Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#EAF3FC]/80 dark:bg-[#202F42]/80 border border-[#CFE1F2] dark:border-[#39506B]">
                    <div>
                      <h4 className="text-sm font-bold font-serif text-[#16273B] dark:text-slate-100 flex items-center gap-1.5">
                        <span>Quản Lý Đơn Request Gửi Yui</span>
                      </h4>
                      <p className="text-xs text-[#5E7C99] dark:text-[#A4C0DA]">
                        Duyệt, phản hồi hoặc yêu cầu bổ sung (gồm cả đơn Công khai và Riêng tư)
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-[#172536] p-1.5 rounded-xl border border-[#DCE9F5] dark:border-[#39506B] text-xs">
                      {[
                        { id: 'all', label: 'Tất cả' },
                        { id: 'pending_approval', label: 'Chờ duyệt' },
                        { id: 'approved', label: 'Đã duyệt' },
                        { id: 'needs_revision', label: 'Cần bổ sung' },
                        { id: 'responded', label: 'Đã phản hồi' },
                        { id: 'rejected', label: 'Từ chối' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setRequestFilter(f.id as any)}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                            requestFilter === f.id
                              ? 'bg-[#4E7AA5] text-white shadow-sm'
                              : 'text-[#5E7C99] dark:text-slate-300 hover:bg-[#EAF3FC] dark:hover:bg-[#23374F]'
                          }`}
                        >
                          {f.label} ({f.id === 'all' ? adminRequests.length : adminRequests.filter((r) => r.status === f.id).length})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Requests List */}
                  <div className="space-y-4">
                    {adminRequests.filter((r) => requestFilter === 'all' || r.status === requestFilter).length === 0 ? (
                      <div className="text-center py-12 bg-white/70 dark:bg-slate-900/50 rounded-2xl border border-dashed border-[#CFE1F2] dark:border-slate-800 text-[#64829E] font-serif text-xs">
                        Không có đơn nào trong trạng thái này.
                      </div>
                    ) : (
                      adminRequests
                        .filter((r) => requestFilter === 'all' || r.status === requestFilter)
                        .map((req) => {
                          const statusColors = {
                            pending_approval: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300',
                            approved: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
                            needs_revision: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300',
                            responded: 'bg-[#EAF3FC] text-[#36597A] border-[#CFE1F2] dark:bg-[#23374F] dark:text-[#A8CDF0]',
                            rejected: 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400',
                          };
                          const statusLabels = {
                            pending_approval: '⏳ Chờ xác nhận',
                            approved: '✓ Đã nhận đơn',
                            needs_revision: '⚠️ Cần bổ sung thêm',
                            responded: '💌 Yui đã phản hồi',
                            rejected: '✕ Đã từ chối',
                          };

                          return (
                            <div
                              key={req.id}
                              className="p-5 rounded-2xl bg-white dark:bg-[#1E2E43] border border-[#CFE1F2] dark:border-[#39506B] shadow-xs space-y-4 relative overflow-hidden"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-bold font-serif text-[#16273B] dark:text-white">
                                      {req.senderName}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EAF3FC] dark:bg-[#23374F] text-[#36597A] dark:text-[#A8CDF0] border border-[#CFE1F2] dark:border-[#39506B]">
                                      {req.requestType}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                      req.isPrivate
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                        : 'bg-[#F2F8FE] dark:bg-[#243750] text-[#4E7AA5] dark:text-[#A8CDF0] border-[#DCEAF6] dark:border-[#39506B]'
                                    }`}>
                                      {req.isPrivate ? '🔒 Riêng tư' : '🌐 Công khai'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-[#64829E] dark:text-[#A4C0DA] font-serif">
                                    Gửi lúc: {new Date(req.createdAt).toLocaleString('vi-VN')}
                                  </div>
                                </div>

                                <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${statusColors[req.status] || ''}`}>
                                  {statusLabels[req.status] || req.status}
                                </span>
                              </div>

                              {/* Content */}
                              <div className="p-3.5 rounded-xl bg-[#F5FAFF] dark:bg-[#172536] border border-[#DCE9F5] dark:border-[#334963] text-xs font-serif leading-relaxed text-[#334A60] dark:text-slate-200 whitespace-pre-wrap">
                                {req.content}
                              </div>

                              {/* Attached Image */}
                              {req.imageUrl && (
                                <div className="space-y-1">
                                  <div className="text-[10px] font-serif opacity-70">Ảnh đính kèm:</div>
                                  <img
                                    src={req.imageUrl}
                                    alt="Request attachment"
                                    className="max-h-48 rounded-xl object-cover border border-[#DCE9F5] dark:border-slate-700 shadow-sm"
                                  />
                                </div>
                              )}

                              {req.adminNote && (
                                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 font-serif space-y-1">
                                  <span className="font-bold">Ghi chú yêu cầu bổ sung của Yui:</span>
                                  <p>{req.adminNote}</p>
                                </div>
                              )}

                              {req.creatorResponse && (
                                <div className="p-3 rounded-xl bg-[#EAF3FC] dark:bg-[#23374F] border border-[#CFE1F2] dark:border-[#39506B] text-xs text-[#16273B] dark:text-[#E5EDF5] font-serif space-y-1">
                                  <span className="font-bold">Phản hồi từ Yui:</span>
                                  <p>{req.creatorResponse}</p>
                                </div>
                              )}

                              {/* Action Controls */}
                              <div className="pt-3 border-t border-[#DCE9F5] dark:border-[#334963] flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2 w-full">
                                  {req.status === 'pending_approval' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          await updateCreatorRequest(req.id, { status: 'approved' });
                                          if (onToast) onToast('✓ Đã xác nhận đơn thành công!');
                                        }}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1 cursor-pointer"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Xác nhận đơn</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          await updateCreatorRequest(req.id, { status: 'needs_revision', adminNote: 'Yui cần bạn bổ sung thêm chi tiết nhé!' });
                                          if (onToast) onToast('⚠️ Đã yêu cầu bổ sung thông tin');
                                        }}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#4E7AA5] hover:bg-[#36597A] text-white shadow-sm flex items-center gap-1 cursor-pointer"
                                      >
                                        <span>Cần bổ sung</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          await updateCreatorRequest(req.id, { status: 'rejected' });
                                          if (onToast) onToast('✕ Đã từ chối đơn');
                                        }}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                                      >
                                        Từ chối
                                      </button>
                                    </>
                                  )}

                                  {/* Creator Reply Form */}
                                  <div className="w-full flex items-center gap-2 mt-1">
                                    <input
                                      type="text"
                                      value={creatorReplyInputs[req.id] || ''}
                                      onChange={(e) =>
                                        setCreatorReplyInputs({ ...creatorReplyInputs, [req.id]: e.target.value })
                                      }
                                      placeholder="Viết phản hồi với tư cách Yui..."
                                      className="flex-1 px-3 py-1.5 bg-[#F5FAFF] dark:bg-[#172536] border border-[#DCE9F5] dark:border-[#39506B] rounded-xl text-xs font-serif"
                                    />
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const reply = creatorReplyInputs[req.id];
                                        if (!reply || !reply.trim()) {
                                          if (onToast) onToast('⚠️ Vui lòng nhập nội dung phản hồi');
                                          return;
                                        }
                                        await updateCreatorRequest(req.id, {
                                          status: 'responded',
                                          creatorResponse: reply.trim(),
                                          respondedAt: new Date().toISOString(),
                                        });
                                        setCreatorReplyInputs({ ...creatorReplyInputs, [req.id]: '' });
                                        if (onToast) onToast('💌 Đã gửi phản hồi đến người dùng!');
                                      }}
                                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] hover:brightness-105 text-white shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                      <span>Gửi phản hồi</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setRequestToDelete(req.id)}
                                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                                      title="Xóa tờ đơn"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Suggested Avatars Management */}
              {activeTab === 'avatars' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#EAF3FC]/80 dark:bg-[#202F42]/80 border border-[#CFE1F2] dark:border-[#39506B]">
                    <div>
                      <h4 className="text-sm font-bold font-serif text-[#16273B] dark:text-slate-100 flex items-center gap-1.5">
                        <span>Quản Lý Avatar Gợi Ý Cho Người Dùng</span>
                      </h4>
                      <p className="text-xs text-[#5E7C99] dark:text-[#A4C0DA]">
                        Tải lên các mẫu avatar để người dùng chọn nhanh trong hồ sơ cá nhân
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {suggestedAvatars.length > 0 && (
                        <button
                          type="button"
                          onClick={async () => {
                            await clearAllSuggestedAvatars();
                            if (onToast) onToast('🗑️ Đã xóa toàn bộ avatar gợi ý trên hệ thống');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-[#DCEBFA] text-[#4E7AA5] border border-[#CFE1F2] dark:border-slate-700 transition-colors shrink-0 cursor-pointer"
                          title="Xóa tất cả avatar gợi ý"
                        >
                          Xóa tất cả
                        </button>
                      )}
                      <input
                        type="text"
                        value={avatarNameInput}
                        onChange={(e) => setAvatarNameInput(e.target.value)}
                        placeholder="Tên gợi ý (tùy chọn)..."
                        className="px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-[#DCE9F5] dark:border-slate-800 font-serif w-full sm:w-44"
                      />
                      <input
                        ref={avatarFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleUploadAvatarFiles}
                      />
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] hover:brightness-105 text-white shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh lên</span>
                      </button>
                    </div>
                  </div>

                  {/* Avatars Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {suggestedAvatars.length === 0 ? (
                      <div className="col-span-full text-center py-12 bg-white/70 dark:bg-slate-900/50 rounded-2xl border border-dashed border-[#CFE1F2] dark:border-slate-800 text-[#64829E] font-serif text-xs">
                        Chưa có avatar gợi ý nào được tải lên.
                      </div>
                    ) : (
                      suggestedAvatars.map((item) => (
                        <div
                          key={item.id}
                          className="group relative p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCE9F5] dark:border-slate-800 shadow-sm flex flex-col items-center gap-2"
                        >
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#DCE9F5] dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <span className="text-[11px] font-bold font-serif text-slate-800 dark:text-slate-200 truncate max-w-full">
                            {item.name}
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteSuggestedAvatar(item.id);
                              if (onToast) onToast(`🗑️ Đã xóa avatar: ${item.name}`);
                            }}
                            className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-[#4E7AA5] hover:bg-[#36597A] text-white shadow-md cursor-pointer transition-transform active:scale-90"
                            title={`Xóa avatar ${item.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Contacts Management */}
              {activeTab === 'contacts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#EAF3FC]/80 dark:bg-[#202F42]/80 border border-[#CFE1F2] dark:border-[#39506B]">
                    <div>
                      <h4 className="text-sm font-bold font-serif text-[#16273B] dark:text-white">
                        Quản Lý Kênh Liên Hệ
                      </h4>
                      <p className="text-xs text-[#5E7C99] dark:text-[#A4C0DA]">
                        Cập nhật Facebook, TikTok, Discord hoặc trang cá nhân của Yui
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartCreateContact}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm liên hệ</span>
                    </button>
                  </div>

                  {(isCreatingContact || editingContact) && (
                    <form onSubmit={handleSaveContactClick} className="p-4 rounded-2xl bg-white dark:bg-[#1E2E43] border border-[#CFE1F2] dark:border-[#39506B] space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={contactLabel}
                          onChange={(e) => setContactLabel(e.target.value)}
                          placeholder="Tên kênh (VD: Facebook của Yui)"
                          className="px-3 py-2 rounded-xl text-xs bg-[#F5FAFF] dark:bg-[#172536] border border-[#DCE9F5] dark:border-[#39506B]"
                        />
                        <select
                          value={contactIconType}
                          onChange={(e) => setContactIconType(e.target.value as ContactLink['iconType'])}
                          className="px-3 py-2 rounded-xl text-xs bg-[#F5FAFF] dark:bg-[#172536] border border-[#DCE9F5] dark:border-[#39506B]"
                        >
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="discord">Discord</option>
                          <option value="tiktok">TikTok</option>
                          <option value="email">Email</option>
                          <option value="web">Website</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>
                      <input
                        type="url"
                        required
                        value={contactValue}
                        onChange={(e) => setContactValue(e.target.value)}
                        placeholder="Đường link đầy đủ (https://...)"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-[#F5FAFF] dark:bg-[#172536] border border-[#DCE9F5] dark:border-[#39506B]"
                      />
                      <input
                        type="text"
                        value={contactDisplay}
                        onChange={(e) => setContactDisplay(e.target.value)}
                        placeholder="Chữ hiển thị (tùy chọn)..."
                        className="w-full px-3 py-2 rounded-xl text-xs bg-[#F5FAFF] dark:bg-[#172536] border border-[#DCE9F5] dark:border-[#39506B]"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            ref={contactFileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleContactImageUpload}
                          />
                          <button
                            type="button"
                            onClick={() => contactFileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EAF3FC] dark:bg-[#23374F] text-[#36597A] dark:text-[#A8CDF0] cursor-pointer"
                          >
                            {contactImageUrl ? 'Đổi ảnh đính kèm' : 'Đính kèm ảnh (tùy chọn)'}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingContact(null);
                              setIsCreatingContact(false);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#4E7AA5] text-white cursor-pointer"
                          >
                            Lưu liên hệ
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2.5">
                    {contacts
                      .filter((c) => c.iconType !== 'ngl' && !c.label.toLowerCase().includes('ngl'))
                      .map((c) => (
                        <div
                          key={c.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-[#1E2E43] border border-[#DCE9F5] dark:border-[#39506B] flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#16273B] dark:text-white truncate">{c.label}</p>
                            <p className="text-[11px] text-[#5E7C99] dark:text-[#A4C0DA] truncate font-mono">{c.value}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditContact(c)}
                              className="p-1.5 rounded-lg text-[#4E7AA5] hover:bg-[#EAF3FC] cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteContact && (
                              <button
                                type="button"
                                onClick={() => onDeleteContact(c.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {activeTab === 'winterMailbox' && (
                <WinterMailboxAdmin onToast={onToast} />
              )}

              {activeTab === 'secretLetters' && (
                <SecretLettersAdmin onToast={onToast} />
              )}

            </div>
          </motion.div>

          {/* 1. Confirmation Modal for Character Deletion */}
          <AnimatePresence>
            {characterToDelete && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 10 }}
                  className="bg-white dark:bg-[#172536] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#CFE1F2] dark:border-[#39506B] text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF3FC] dark:bg-[#23374F] text-[#4E7AA5] mx-auto flex items-center justify-center border border-[#CFE1F2] dark:border-[#39506B]">
                    <Trash2 className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-[#16273B] dark:text-white">
                      Xác nhận xóa nhân vật?
                    </h4>
                    <p className="text-xs text-[#5E7C99] dark:text-slate-400">
                      Bạn có chắc chắn muốn xóa nhân vật <span className="font-bold text-[#4E7AA5] dark:text-[#A8CDF0]">&ldquo;{characterToDelete.name}&rdquo;</span>? Thao tác này sẽ xóa vĩnh viễn khỏi hệ thống.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCharacterToDelete(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = characterToDelete.id;
                        setCharacterToDelete(null);
                        onDeleteCharacter(targetId);
                      }}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-[#36597A] hover:bg-[#27435E] text-white shadow-md transition-colors cursor-pointer"
                    >
                      Xóa vĩnh viễn
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Confirmation Modal for Creator Request Deletion */}
          <AnimatePresence>
            {requestToDelete && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 10 }}
                  className="bg-white dark:bg-[#172536] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#CFE1F2] dark:border-[#39506B] text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF3FC] dark:bg-[#23374F] text-[#4E7AA5] mx-auto flex items-center justify-center border border-[#CFE1F2] dark:border-[#39506B]">
                    <Trash2 className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-[#16273B] dark:text-white">
                      Xác nhận xóa tờ đơn?
                    </h4>
                    <p className="text-xs text-[#5E7C99] dark:text-slate-400">
                      Bạn có chắc chắn muốn xóa tờ đơn yêu cầu này không?
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRequestToDelete(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const targetId = requestToDelete;
                        setRequestToDelete(null);
                        await deleteCreatorRequest(targetId);
                        if (onToast) onToast('🗑️ Đã xóa tờ đơn thành công!');
                      }}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-[#36597A] hover:bg-[#27435E] text-white shadow-md transition-colors cursor-pointer"
                    >
                      Xóa đơn
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Confirmation Modal for Reset All Votes */}
          <AnimatePresence>
            {isConfirmingResetVotes && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 10 }}
                  className="bg-white dark:bg-[#172536] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#CFE1F2] dark:border-[#39506B] text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF3FC] dark:bg-[#23374F] text-[#4E7AA5] mx-auto flex items-center justify-center border border-[#CFE1F2] dark:border-[#39506B]">
                    <RotateCcw className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-[#16273B] dark:text-white">
                      Đặt lại 0 tim tất cả?
                    </h4>
                    <p className="text-xs text-[#5E7C99] dark:text-slate-400">
                      Toàn bộ lượt bình chọn tim của tất cả nhân vật sẽ được đặt về 0. Người dùng và Yui sẽ bắt đầu bình chọn lại từ đầu.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsConfirmingResetVotes(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsConfirmingResetVotes(false);
                        if (onResetAllVotes) onResetAllVotes();
                      }}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-[#36597A] hover:bg-[#27435E] text-white shadow-md transition-colors cursor-pointer"
                    >
                      Xác nhận đặt lại
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};


