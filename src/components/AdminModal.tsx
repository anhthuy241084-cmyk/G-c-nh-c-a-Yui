import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Edit2, Trash2, ShieldCheck, Save, Upload, FileText, Globe, Lock, Bell, Megaphone, Send, Eye, EyeOff, KeyRound, Mail, Sparkles, RotateCcw, Loader2, Tag, Check, Heart, Image as ImageIcon, Video, Film, Sliders, RefreshCw, HelpCircle, BookOpen, ChevronRight, Layers } from 'lucide-react';
import { Character, PRESET_TAGS, Feature, FeatureBoardConfig, FeatureStatus, CreatorRequest, ContactLink, HeroPresentationConfig, DEFAULT_HERO_PRESENTATION, HelpCenterConfig, DEFAULT_HELP_CENTER_CONFIG, HelpGuideCategory, HelpGuideItem, WelcomeLetterConfig, DEFAULT_WELCOME_LETTER } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import { subscribeCreatorRequests, updateCreatorRequest, deleteCreatorRequest } from '../services/creatorRequestService';
import { SuggestedAvatar, subscribeSuggestedAvatars, addSuggestedAvatar, deleteSuggestedAvatar, clearAllSuggestedAvatars } from '../services/suggestedAvatarService';

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
  // Help Center config & manager
  helpCenterConfig?: HelpCenterConfig;
  onSaveHelpCenterConfig?: (config: HelpCenterConfig) => Promise<void>;
  // Features extensions (backward compatibility)
  features?: Feature[];
  boardConfig?: FeatureBoardConfig;
  onSaveFeature?: (feature: Feature) => Promise<void>;
  onDeleteFeature?: (id: string) => Promise<void>;
  onSaveBoardConfig?: (config: FeatureBoardConfig) => Promise<void>;
  onOpenCommandLibrary?: () => void;
  contacts?: ContactLink[];
  onSaveContact?: (contact: ContactLink) => Promise<void>;
  onDeleteContact?: (id: string) => Promise<void>;
  onReorderContacts?: (contacts: ContactLink[]) => Promise<void>;
  heroPresentation?: HeroPresentationConfig;
  onSaveHeroPresentation?: (config: HeroPresentationConfig) => Promise<void>;
  welcomeLetterConfig?: WelcomeLetterConfig;
  onSaveWelcomeLetter?: (config: WelcomeLetterConfig) => Promise<void>;
  onPreviewWelcomeLetter?: () => void;
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
  helpCenterConfig = DEFAULT_HELP_CENTER_CONFIG,
  onSaveHelpCenterConfig,
  features = [],
  boardConfig = { description: '' },
  onSaveFeature,
  onDeleteFeature,
  onSaveBoardConfig,
  onOpenCommandLibrary,
  contacts = [],
  onSaveContact,
  onDeleteContact,
  onReorderContacts,
  heroPresentation = DEFAULT_HERO_PRESENTATION,
  onSaveHeroPresentation,
  welcomeLetterConfig,
  onSaveWelcomeLetter,
  onPreviewWelcomeLetter,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit' | 'notify' | 'helpcenter' | 'requests' | 'avatars' | 'contacts' | 'presentation'>('list');
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
  const [adminNoteInputs, setAdminNoteInputs] = useState<Record<string, string>>({});
  const [suggestedAvatars, setSuggestedAvatars] = useState<SuggestedAvatar[]>([]);
  const [avatarNameInput, setAvatarNameInput] = useState('');
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // 🎬 Presentation & Video Layer States
  const [presIsEnabled, setPresIsEnabled] = useState<boolean>(heroPresentation.isEnabled);
  const [presVideoUrl, setPresVideoUrl] = useState<string>(heroPresentation.videoUrl || '');
  const [presVideoName, setPresVideoName] = useState<string>(heroPresentation.videoName || '');
  const [presOpacity, setPresOpacity] = useState<number>(heroPresentation.overlayOpacity ?? 0.4);
  const [presBlendMode, setPresBlendMode] = useState<'normal' | 'screen' | 'overlay' | 'soft-light'>(heroPresentation.blendMode || 'screen');
  const [presBlur, setPresBlur] = useState<number>(heroPresentation.blurAmount ?? 0);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // ✉️ Welcome Letter States
  const [letterTitle, setLetterTitle] = useState(welcomeLetterConfig?.title || DEFAULT_WELCOME_LETTER.title);
  const [letterGreeting, setLetterGreeting] = useState(welcomeLetterConfig?.greeting || DEFAULT_WELCOME_LETTER.greeting);
  const [letterClosing, setLetterClosing] = useState(welcomeLetterConfig?.closing || DEFAULT_WELCOME_LETTER.closing);
  const [letterSignature, setLetterSignature] = useState(welcomeLetterConfig?.signature || DEFAULT_WELCOME_LETTER.signature);

  useEffect(() => {
    if (welcomeLetterConfig) {
      setLetterTitle(welcomeLetterConfig.title);
      setLetterGreeting(welcomeLetterConfig.greeting);
      setLetterClosing(welcomeLetterConfig.closing);
      setLetterSignature(welcomeLetterConfig.signature);
    }
  }, [welcomeLetterConfig]);

  useEffect(() => {
    if (heroPresentation) {
      setPresIsEnabled(heroPresentation.isEnabled);
      setPresVideoUrl(heroPresentation.videoUrl || '');
      setPresVideoName(heroPresentation.videoName || '');
      setPresOpacity(heroPresentation.overlayOpacity ?? 0.4);
      setPresBlendMode(heroPresentation.blendMode || 'screen');
      setPresBlur(heroPresentation.blurAmount ?? 0);
    }
  }, [heroPresentation]);

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

  // Features Management States (legacy)
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [isCreatingFeature, setIsCreatingFeature] = useState(false);
  const [boardDescInput, setBoardDescInput] = useState(boardConfig.description || '');

  // Help Center Handbook Editor States
  const [helpConfig, setHelpConfig] = useState<HelpCenterConfig>(helpCenterConfig || DEFAULT_HELP_CENTER_CONFIG);
  const [activeHelpCatKey, setActiveHelpCatKey] = useState<string>(helpCenterConfig?.categories?.[0]?.key || 'explore');
  const [editingHelpItem, setEditingHelpItem] = useState<{ catKey: string; item: HelpGuideItem } | null>(null);
  const [isAddingHelpItem, setIsAddingHelpItem] = useState(false);
  const [helpItemTitle, setHelpItemTitle] = useState('');
  const [helpItemDesc, setHelpItemDesc] = useState('');
  const [helpItemBadge, setHelpItemBadge] = useState('');
  const [helpItemAction, setHelpItemAction] = useState<HelpGuideItem['linkAction']>(undefined);
  const [isSavingHelpCenter, setIsSavingHelpCenter] = useState(false);

  // General fields
  const [helpMainTitle, setHelpMainTitle] = useState(helpCenterConfig?.mainTitle || DEFAULT_HELP_CENTER_CONFIG.mainTitle);
  const [helpSubTitle, setHelpSubTitle] = useState(helpCenterConfig?.subTitle || DEFAULT_HELP_CENTER_CONFIG.subTitle);
  const [helpBadgeText, setHelpBadgeText] = useState(helpCenterConfig?.badgeText || DEFAULT_HELP_CENTER_CONFIG.badgeText);
  const [helpAnnouncementNote, setHelpAnnouncementNote] = useState(helpCenterConfig?.announcementNote || DEFAULT_HELP_CENTER_CONFIG.announcementNote || '');

  useEffect(() => {
    if (helpCenterConfig) {
      setHelpConfig(helpCenterConfig);
      setHelpMainTitle(helpCenterConfig.mainTitle || DEFAULT_HELP_CENTER_CONFIG.mainTitle);
      setHelpSubTitle(helpCenterConfig.subTitle || DEFAULT_HELP_CENTER_CONFIG.subTitle);
      setHelpBadgeText(helpCenterConfig.badgeText || DEFAULT_HELP_CENTER_CONFIG.badgeText);
      setHelpAnnouncementNote(helpCenterConfig.announcementNote || '');
    }
  }, [helpCenterConfig]);

  // Feature Form States
  const [featName, setFeatName] = useState('');
  const [featDescription, setFeatDescription] = useState('');
  const [featDetailedDescription, setFeatDetailedDescription] = useState('');
  const [featUsageGuide, setFeatUsageGuide] = useState('');
  const [featTagsInput, setFeatTagsInput] = useState('');
  const [featCategory, setFeatCategory] = useState('');
  const [featStatus, setFeatStatus] = useState<FeatureStatus>('active');
  const [featDisplayOrder, setFeatDisplayOrder] = useState<number>(0);
  const [featIsPublic, setFeatIsPublic] = useState<boolean>(true);
  const [featUpdateInfo, setFeatUpdateInfo] = useState('');
  const [featDecorationStyle, setFeatDecorationStyle] = useState<'flower' | 'star' | 'ribbon'>('flower');

  useEffect(() => {
    if (boardConfig) {
      setBoardDescInput(boardConfig.description || '');
    }
  }, [boardConfig]);


  // Form states
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState(''); // Tagline
  const [formAvatar, setFormAvatar] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formChatUrl, setFormChatUrl] = useState('');
  const [formChatUrl2, setFormChatUrl2] = useState('');
  const [formChatUrlLabel, setFormChatUrlLabel] = useState('');
  const [formChatUrl2Label, setFormChatUrl2Label] = useState('');
  const [formCreator, setFormCreator] = useState('Admin');
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
  const [featureToDelete, setFeatureToDelete] = useState<{ id: string; name: string } | null>(null);
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
    setFormCreator(savedDraft.creator || 'Admin');
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
    setFormCreator('Admin');
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
    setFormCreator(char.creator || 'Admin');
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
        const compressed = await compressImageFile(file, 600, 600, 0.82);
        setFormAvatar(compressed);
        if (onToast) onToast('✨ Ảnh avatar đã được tối ưu hóa chuẩn Cloud!');
      } catch (err) {
        console.warn('Compression failed, using standard reader:', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setFormAvatar(event.target.result as string);
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
        creator: formCreator || 'Admin',
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
        creator: formCreator || 'Admin',
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
        creator: formCreator || 'Admin',
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
        creator: formCreator || 'Admin',
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

  // Help Center Handbook Handlers
  const handleSaveAllHelpCenterConfig = async (overrideConfig?: HelpCenterConfig) => {
    const configToSave: HelpCenterConfig = overrideConfig || {
      ...helpConfig,
      mainTitle: helpMainTitle.trim() || DEFAULT_HELP_CENTER_CONFIG.mainTitle,
      subTitle: helpSubTitle.trim() || DEFAULT_HELP_CENTER_CONFIG.subTitle,
      badgeText: helpBadgeText.trim() || DEFAULT_HELP_CENTER_CONFIG.badgeText,
      announcementNote: helpAnnouncementNote.trim(),
      updatedAt: new Date().toISOString(),
    };

    if (onSaveHelpCenterConfig) {
      try {
        setIsSavingHelpCenter(true);
        await onSaveHelpCenterConfig(configToSave);
        setHelpConfig(configToSave);
        if (onToast) onToast('💾 Đã lưu và đồng bộ Sổ Tay Trợ Giúp thành công! ♡');
      } catch (err) {
        console.error(err);
        if (onToast) onToast('❌ Lỗi khi lưu Sổ Tay Trợ Giúp');
      } finally {
        setIsSavingHelpCenter(false);
      }
    }
  };

  const handleStartAddHelpItem = (catKey: string) => {
    setActiveHelpCatKey(catKey);
    setEditingHelpItem(null);
    setIsAddingHelpItem(true);
    setHelpItemTitle('');
    setHelpItemDesc('');
    setHelpItemBadge('');
    setHelpItemAction(undefined);
  };

  const handleStartEditHelpItem = (catKey: string, item: HelpGuideItem) => {
    setActiveHelpCatKey(catKey);
    setEditingHelpItem({ catKey, item });
    setIsAddingHelpItem(false);
    setHelpItemTitle(item.title);
    setHelpItemDesc(item.desc);
    setHelpItemBadge(item.badge || '');
    setHelpItemAction(item.linkAction);
  };

  const handleSaveHelpItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpItemTitle.trim() || !helpItemDesc.trim()) {
      if (onToast) onToast('⚠️ Vui lòng nhập tiêu đề và nội dung hướng dẫn!');
      return;
    }

    const updatedCategories = (helpConfig.categories || DEFAULT_HELP_CENTER_CONFIG.categories).map((cat) => {
      if (cat.key !== activeHelpCatKey) return cat;

      if (editingHelpItem) {
        const updatedItems = cat.items.map((it) =>
          it.id === editingHelpItem.item.id
            ? {
                ...it,
                title: helpItemTitle.trim(),
                desc: helpItemDesc.trim(),
                badge: helpItemBadge.trim() || undefined,
                linkAction: helpItemAction,
              }
            : it
        );
        return { ...cat, items: updatedItems };
      } else {
        const newItem: HelpGuideItem = {
          id: 'item_' + Date.now(),
          title: helpItemTitle.trim(),
          desc: helpItemDesc.trim(),
          badge: helpItemBadge.trim() || undefined,
          linkAction: helpItemAction,
        };
        return { ...cat, items: [...cat.items, newItem] };
      }
    });

    const newConfig: HelpCenterConfig = {
      ...helpConfig,
      categories: updatedCategories,
      mainTitle: helpMainTitle.trim() || DEFAULT_HELP_CENTER_CONFIG.mainTitle,
      subTitle: helpSubTitle.trim() || DEFAULT_HELP_CENTER_CONFIG.subTitle,
      badgeText: helpBadgeText.trim() || DEFAULT_HELP_CENTER_CONFIG.badgeText,
      announcementNote: helpAnnouncementNote.trim(),
      updatedAt: new Date().toISOString(),
    };

    setHelpConfig(newConfig);
    setIsAddingHelpItem(false);
    setEditingHelpItem(null);
    await handleSaveAllHelpCenterConfig(newConfig);
  };

  const handleDeleteHelpItem = async (catKey: string, itemId: string) => {
    const updatedCategories = (helpConfig.categories || DEFAULT_HELP_CENTER_CONFIG.categories).map((cat) => {
      if (cat.key !== catKey) return cat;
      return {
        ...cat,
        items: cat.items.filter((it) => it.id !== itemId),
      };
    });

    const newConfig: HelpCenterConfig = {
      ...helpConfig,
      categories: updatedCategories,
      updatedAt: new Date().toISOString(),
    };

    setHelpConfig(newConfig);
    await handleSaveAllHelpCenterConfig(newConfig);
    if (onToast) onToast('🗑️ Đã xóa mục hướng dẫn!');
  };

  const handleResetHelpConfigToDefault = async () => {
    setHelpConfig(DEFAULT_HELP_CENTER_CONFIG);
    setHelpMainTitle(DEFAULT_HELP_CENTER_CONFIG.mainTitle);
    setHelpSubTitle(DEFAULT_HELP_CENTER_CONFIG.subTitle);
    setHelpBadgeText(DEFAULT_HELP_CENTER_CONFIG.badgeText);
    setHelpAnnouncementNote(DEFAULT_HELP_CENTER_CONFIG.announcementNote || '');
    await handleSaveAllHelpCenterConfig(DEFAULT_HELP_CENTER_CONFIG);
    if (onToast) onToast('✨ Đã khôi phục toàn bộ nội dung Sổ Tay Trợ Giúp về mặc định!');
  };

  // Feature Summary Board Handlers (legacy)
  const handleSaveBoardConfigClick = () => {
    if (onSaveBoardConfig) {
      onSaveBoardConfig({ description: boardDescInput.trim() })
        .then(() => {
          if (onToast) onToast('💾 Đã cập nhật dòng mô tả của Bảng tính năng! ♡');
        })
        .catch(() => {
          if (onToast) onToast('❌ Gặp lỗi khi cập nhật mô tả.');
        });
    }
  };

  const handleStartCreateFeature = () => {
    setEditingFeature(null);
    setIsCreatingFeature(true);
    setFeatName('');
    setFeatDescription('');
    setFeatDetailedDescription('');
    setFeatUsageGuide('');
    setFeatTagsInput('');
    setFeatCategory('');
    setFeatStatus('active');
    setFeatDisplayOrder(features.length + 1);
    setFeatIsPublic(true);
    setFeatUpdateInfo('');
    setFeatDecorationStyle('flower');
  };

  const handleStartEditFeature = (feat: Feature) => {
    setEditingFeature(feat);
    setIsCreatingFeature(false);
    setFeatName(feat.name);
    setFeatDescription(feat.description);
    setFeatDetailedDescription(feat.detailedDescription || '');
    setFeatUsageGuide(feat.usageGuide || '');
    setFeatTagsInput(feat.tags ? feat.tags.join(', ') : '');
    setFeatCategory(feat.category);
    setFeatStatus(feat.status);
    setFeatDisplayOrder(feat.displayOrder ?? 0);
    setFeatIsPublic(feat.isPublic);
    setFeatUpdateInfo(feat.updateInfo || '');
    setFeatDecorationStyle(feat.decorationStyle || 'flower');
  };

  const handleSaveFeatureClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!featName.trim() || !featDescription.trim() || !featCategory.trim()) {
      if (onToast) onToast('⚠️ Vui lòng điền đầy đủ các thông tin bắt buộc! *');
      return;
    }

    const tagsArray = featTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const targetId = editingFeature ? editingFeature.id : 'feat_' + Date.now();

    const finalFeature: Feature = {
      id: targetId,
      name: featName.trim(),
      description: featDescription.trim(),
      detailedDescription: featDetailedDescription.trim(),
      usageGuide: featUsageGuide.trim(),
      tags: tagsArray,
      category: featCategory.trim(),
      status: featStatus,
      displayOrder: Number(featDisplayOrder) || 0,
      isPublic: featIsPublic,
      updateInfo: featUpdateInfo.trim(),
      decorationStyle: featDecorationStyle,
    };

    if (onSaveFeature) {
      onSaveFeature(finalFeature)
        .then(() => {
          if (onToast) {
            onToast(editingFeature ? '💾 Đã chỉnh sửa tính năng thành công! ♡' : '✨ Đã thêm tính năng mới thành công! ♡');
          }
          setIsCreatingFeature(false);
          setEditingFeature(null);
        })
        .catch(() => {
          if (onToast) onToast('❌ Lỗi khi lưu tính năng.');
        });
    }
  };

  const handleDeleteFeatureClick = (id: string, name: string) => {
    setFeatureToDelete({ id, name });
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Quản lý & Sáng tạo</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500 text-white font-medium">Admin</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Đăng tải, cài riêng tư, bản nháp & gửi thông báo mới
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    activeTab === 'list'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Danh sách ({characters.length})
                </button>

                <button
                  onClick={handleStartCreate}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                    activeTab === 'create'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm mới</span>
                </button>

                <button
                  onClick={() => setActiveTab('notify')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                    activeTab === 'notify'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Tạo Thông Báo</span>
                </button>


                <button
                  onClick={() => setActiveTab('helpcenter')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                    activeTab === 'helpcenter'
                      ? 'bg-[#38CAD6] text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-[#1B6E7D] dark:text-[#48CCD6] hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Sổ Tay Trợ Giúp</span>
                </button>

                <button
                  onClick={() => setActiveTab('requests')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors relative ${
                    activeTab === 'requests'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Đơn Request</span>
                  {adminRequests.filter((r) => r.status === 'pending_approval').length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold animate-pulse shadow-sm">
                      {adminRequests.filter((r) => r.status === 'pending_approval').length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('avatars')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'avatars'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Avatar Gợi Ý</span>
                </button>

                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'contacts'
                      ? 'bg-[#3FAAB7] text-white shadow-md'
                      : 'bg-white dark:bg-[#102F38] text-[#247C8C] dark:text-[#78DCE0] hover:bg-[#E5F5F7] dark:hover:bg-[#143943]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Liên Hệ</span>
                </button>

                <button
                  onClick={() => setActiveTab('presentation')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'presentation'
                      ? 'bg-[#3FAAB7] text-white shadow-md'
                      : 'bg-white dark:bg-[#102F38] text-[#247C8C] dark:text-[#78DCE0] hover:bg-[#E5F5F7] dark:hover:bg-[#143943]'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Ứng Dụng & Trình Chiếu</span>
                </button>

                {onOpenCommandLibrary && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCommandLibrary();
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80 hover:bg-rose-500 hover:text-white"
                    title="Mở Kho Lệnh để Đăng, Sửa, Sắp xếp và Quản lý Lệnh"
                  >
                    <span className="font-serif font-bold">✦</span>
                    <span>Kho Lệnh ୨୧</span>
                  </button>
                )}
              </div>

              {activeTab === 'list' && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-medium">
                    <button
                      onClick={() => setListFilter('all')}
                      className={`px-2 py-1 rounded-lg transition-colors ${
                        listFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setListFilter('published')}
                      className={`px-2 py-1 rounded-lg transition-colors ${
                        listFilter === 'published' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Công khai
                    </button>
                    <button
                      onClick={() => setListFilter('private')}
                      className={`px-2 py-1 rounded-lg transition-colors ${
                        listFilter === 'private' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Riêng tư
                    </button>
                    <button
                      onClick={() => setListFilter('draft')}
                      className={`px-2 py-1 rounded-lg transition-colors ${
                        listFilter === 'draft' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Bản nháp
                    </button>
                  </div>

                  {onResetAllVotes && (
                    <button
                      onClick={() => setIsConfirmingResetVotes(true)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Đặt lại 0 tim cho tất cả nhân vật"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                      <span>Đặt lại 0 tim tất cả</span>
                    </button>
                  )}
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
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/40 flex items-center gap-1">
                                <Heart className="w-3 h-3 fill-rose-500" />
                                <span>{char.votes || 0} tim</span>
                              </span>
                              {char.chatUrl2 && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F7F9] dark:bg-[#143943] text-[#1B6E7D] dark:text-[#48CCD6] border border-[#38CAD6]/40 flex items-center gap-1" title="Nhân vật có 2 link trò chuyện">
                                  <span>2 link</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-rose-500 font-medium">
                              Tác giả: {char.creator || 'Admin'}
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
                              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
                              title="Xem chi tiết nhân vật"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleCycleStatus(char)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                              char.isDraft
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : char.isPrivate
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
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
                            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
                            title="Sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setCharacterToDelete(char)}
                            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer"
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
                        placeholder="Nhập tên tác giả (Mặc định: Admin)..."
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
                      <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                        ୨୧ STORY (Cốt truyện / Bối cảnh nhân vật)
                      </span>
                      <span className="text-[10px] text-slate-400">Tùy chọn</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formStory || ''}
                      onChange={(e) => setFormStory(e.target.value)}
                      placeholder="Nhập nội dung STORY/Cốt truyện của nhân vật... (Có thể xuống dòng hoặc chia thành các đoạn văn)..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-rose-200/80 dark:border-rose-900/50 text-xs text-slate-900 dark:text-white leading-relaxed resize-y"
                    />
                  </div>

                  {/* Tin nhắn đầu tiên / FIRST MESSAGE */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                        ♡ FIRST MESSAGE (Tin nhắn mở đầu câu chuyện)
                      </span>
                      <span className="text-[10px] text-slate-400">Tùy chọn</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formFirstMessage || ''}
                      onChange={(e) => setFormFirstMessage(e.target.value)}
                      placeholder="Nhập lời mở đầu/tin nhắn đầu tiên của nhân vật... (Giao diện hiển thị trong khung đọc riêng biệt)..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-rose-200/80 dark:border-rose-900/50 text-xs text-slate-900 dark:text-white leading-relaxed resize-y"
                    />
                  </div>

                  {/* Bộ Item trang trí theo Character */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      🎀 Bộ Ký Tự Trang Trí Đọc Truyện (Mặc định: ♡ ୨୧ ♡)
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
                          className={`p-2 rounded-xl text-xs border text-center transition-all ${
                            formDecorativeItemSet === item.val
                              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-700 text-rose-600 dark:text-rose-300 font-bold shadow-xs'
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
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-medium cursor-pointer hover:bg-rose-600 transition-colors shadow-sm">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải ảnh từ tệp máy</span>
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
                        <Globe className="w-3.5 h-3.5 text-rose-500" />
                        <span>Đường link trò chuyện / Ggai (Có thể dán 1 hoặc 2 link)</span>
                      </label>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#38CAD6]/15 text-[#1B6E7D] dark:text-[#48CCD6] font-semibold">
                        ✦ Hỗ trợ 2 link
                      </span>
                    </div>

                    {/* Link 1 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
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
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#38CAD6]/30"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={formChatUrlLabel || ''}
                            onChange={(e) => setFormChatUrlLabel(e.target.value)}
                            placeholder="Tên nút (Mặc định: Tiến tới Ggai)"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#38CAD6]/30"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Link 2 */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200/70 dark:border-slate-700/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#1B6E7D] dark:text-[#48CCD6] flex items-center gap-1">
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
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#38CAD6]/30"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={formChatUrl2Label || ''}
                            onChange={(e) => setFormChatUrl2Label(e.target.value)}
                            placeholder="Tên nút 2 (Mặc định: Link 2)"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#38CAD6]/30"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preset & Custom Tags Selection */}
                  <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-rose-500" />
                        <span>Thẻ Tag / Thể loại nhân vật</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingTag(!isAddingTag)}
                        className="text-[11px] font-semibold text-rose-500 hover:underline flex items-center gap-0.5 cursor-pointer"
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
                          className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomTag}
                          className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
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
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-500 text-white shadow-xs"
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
                                  ? 'bg-rose-500/15 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800'
                                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleToggleTag(tag)}
                                className="px-2.5 py-1 text-xs cursor-pointer flex items-center gap-1"
                              >
                                <span>#{tag}</span>
                                {isSelected && <Check className="w-3 h-3 text-rose-500" />}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteAvailableTag(tag, e)}
                                title={`Xóa vĩnh viễn thẻ '${tag}' khỏi danh sách`}
                                className="pr-2 pl-0.5 py-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
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
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 dark:bg-amber-950/50 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Lưu ngay vào danh sách Bản nháp hệ thống để viết tiếp sau"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        <span>💾 Lưu vào Bản nháp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSave()}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md hover:shadow-rose-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{formStatus === 'public' ? '✨ Đăng tải công khai' : formStatus === 'private' ? '🔒 Lưu riêng tư' : '📝 Lưu bản nháp'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Send Notification Tab */}
              {activeTab === 'notify' && (
                <form onSubmit={handleSendAnnouncementSubmit} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-amber-500" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Tạo thông báo mới của Creator
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Thông báo này sẽ xuất hiện trên Chuông thông báo màu vàng của người dùng.
                  </p>

                  {notifSentSuccess && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
                      Đã phát thông báo thành công đến người dùng!
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
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
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
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white leading-relaxed resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>Phát thông báo màu vàng</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 5: Welcome Letter Management (Thư chào mừng) */}
              {activeTab === 'letter' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Thiết lập Thư Chào Mừng (Welcome Letter)
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Nội dung thư do bạn tự viết, xuất hiện khi người dùng lần đầu truy cập app.
                        </p>
                      </div>
                    </div>

                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onPreviewWelcomeLetter) {
                          onPreviewWelcomeLetter();
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Xem thử thư</span>
                    </button>
                  </div>

                  {/* Title Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Tiêu đề lá thư *
                    </label>
                    <input
                      type="text"
                      required
                      value={letterTitle}
                      onChange={(e) => setLetterTitle(e.target.value)}
                      placeholder="VD: Chào mừng bạn đến với góc nhỏ của Yui ♡"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  {/* Greeting & Intro Body Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Lời chào & Giới thiệu ứng dụng *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={letterGreeting}
                      onChange={(e) => setLetterGreeting(e.target.value)}
                      placeholder="Viết lời chào và lời giới thiệu ngắn về góc nhỏ..."
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white leading-relaxed resize-none font-serif"
                    />
                  </div>

                  {/* Closing message Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Lời cảm ơn & Lời kết *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={letterClosing}
                      onChange={(e) => setLetterClosing(e.target.value)}
                      placeholder="VD: Cảm ơn vì đã ghé qua.&#10;Mong rằng bạn sẽ tìm thấy một góc nhỏ mà mình yêu thích ở đây."
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white leading-relaxed resize-none italic"
                    />
                  </div>

                  {/* Signature Field */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Chữ ký tác giả *
                      </label>
                      <input
                        type="text"
                        required
                        value={letterSignature}
                        onChange={(e) => setLetterSignature(e.target.value)}
                        placeholder="VD: Yui ♡"
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold text-rose-500"
                      />
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      🌷 <em>Thư không lưu trong hộp thư hay bookmark. Người dùng đọc xong và ấn "♡ Ghé vào góc nhỏ" là bước thẳng vào ứng dụng.</em>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLetterTitle(DEFAULT_WELCOME_LETTER.title);
                          setLetterGreeting(DEFAULT_WELCOME_LETTER.greeting);
                          setLetterClosing(DEFAULT_WELCOME_LETTER.closing);
                          setLetterSignature(DEFAULT_WELCOME_LETTER.signature);
                          if (onToast) onToast('Đã khôi phục nội dung thư mặc định ♡');
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Mặc định</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          try {
                            localStorage.removeItem('yui_welcome_letter_seen');
                            if (onToast) onToast('Đã đặt lại! Lần tải trang tiếp theo sẽ hiện lại Thư Chào Mừng như khách mới ghé.');
                          } catch (e) {}
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                        title="Xóa cờ đã xem để kiểm tra trải nghiệm khách mới"
                      >
                        🔄 Đặt lại trạng thái như người dùng mới
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const newConfig: WelcomeLetterConfig = {
                            title: letterTitle.trim() || DEFAULT_WELCOME_LETTER.title,
                            greeting: letterGreeting.trim() || DEFAULT_WELCOME_LETTER.greeting,
                            closing: letterClosing.trim() || DEFAULT_WELCOME_LETTER.closing,
                            signature: letterSignature.trim() || DEFAULT_WELCOME_LETTER.signature,
                          };
                          if (onSaveWelcomeLetter) {
                            onSaveWelcomeLetter(newConfig);
                          }
                          if (onToast) {
                            onToast('💾 Đã lưu Thư Chào Mừng thành công! ♡');
                          }
                        }}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Lưu Thư Chào Mừng</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Sổ Tay Trợ Giúp (Help Center Handbook Management) */}
              {activeTab === 'helpcenter' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Part A: General Configuration */}
                  <div className="p-4 rounded-2xl bg-[#F0F9FB]/80 dark:bg-[#091C24]/80 border border-[#38CAD6]/30 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#38CAD6]/20 pb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#1B6E7D] dark:text-[#48CCD6] font-serif">
                        <HelpCircle className="w-4 h-4 text-[#38CAD6]" />
                        <span>Cấu Hình Chung Sổ Tay Trợ Giúp & Hướng Dẫn</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetHelpConfigToDefault}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-white dark:bg-[#0E232E] text-[#53737C] hover:text-[#1B6E7D] dark:text-[#88A9B3] dark:hover:text-[#48CCD6] border border-[#38CAD6]/20 transition-colors cursor-pointer flex items-center gap-1"
                        title="Khôi phục nội dung mặc định của toàn bộ sổ tay"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Mặc định</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Tiêu đề chính Sổ tay
                        </label>
                        <input
                          type="text"
                          value={helpMainTitle}
                          onChange={(e) => setHelpMainTitle(e.target.value)}
                          placeholder="VD: Sổ Tay Trợ Giúp & Hướng Dẫn Hải Trình"
                          className="w-full px-3.5 py-2 bg-white dark:bg-[#0E232E] rounded-xl border border-[#38CAD6]/25 text-xs text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#38CAD6] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Nhãn Badge góc tiêu đề
                        </label>
                        <input
                          type="text"
                          value={helpBadgeText}
                          onChange={(e) => setHelpBadgeText(e.target.value)}
                          placeholder="VD: Guide & Tips"
                          className="w-full px-3.5 py-2 bg-white dark:bg-[#0E232E] rounded-xl border border-[#38CAD6]/25 text-xs text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#38CAD6] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Dòng phụ đề giới thiệu
                      </label>
                      <input
                        type="text"
                        value={helpSubTitle}
                        onChange={(e) => setHelpSubTitle(e.target.value)}
                        placeholder="VD: Khám phá trọn vẹn các tính năng thú vị tại góc nhỏ của Yui"
                        className="w-full px-3.5 py-2 bg-white dark:bg-[#0E232E] rounded-xl border border-[#38CAD6]/25 text-xs text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#38CAD6] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Dòng thông báo / Mẹo nổi bật đầu trang (Bỏ trống nếu không dùng)
                      </label>
                      <input
                        type="text"
                        value={helpAnnouncementNote}
                        onChange={(e) => setHelpAnnouncementNote(e.target.value)}
                        placeholder="VD: 🌊 Mẹo: Bạn có thể kẹp bookmark nhân vật và tạo bộ sưu tập riêng..."
                        className="w-full px-3.5 py-2 bg-white dark:bg-[#0E232E] rounded-xl border border-[#38CAD6]/25 text-xs text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#38CAD6] focus:outline-hidden"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        disabled={isSavingHelpCenter}
                        onClick={() => handleSaveAllHelpCenterConfig()}
                        className="px-4 py-2 bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#1B6E7D]/15"
                      >
                        {isSavingHelpCenter ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Lưu cấu hình chung</span>
                      </button>
                    </div>
                  </div>

                  {/* Part B: Category Tabs & Items List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 font-serif flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#38CAD6]" />
                        <span>Nội Dung Chi Tiết Các Chuyên Mục</span>
                      </h4>
                      {!isAddingHelpItem && !editingHelpItem && (
                        <button
                          type="button"
                          onClick={() => handleStartAddHelpItem(activeHelpCatKey)}
                          className="px-3 py-1.5 bg-[#38CAD6] hover:bg-[#2EB8C4] text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm mục hướng dẫn</span>
                        </button>
                      )}
                    </div>

                    {/* Category Selector Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                      {(helpConfig.categories || DEFAULT_HELP_CENTER_CONFIG.categories).map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => {
                            setActiveHelpCatKey(cat.key);
                            setIsAddingHelpItem(false);
                            setEditingHelpItem(null);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            activeHelpCatKey === cat.key
                              ? 'bg-[#1B6E7D] text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <span>{cat.name}</span>
                          <span className="ml-1 text-[10px] opacity-80">({cat.items.length})</span>
                        </button>
                      ))}
                    </div>

                    {/* Add / Edit Help Item Form */}
                    {(isAddingHelpItem || editingHelpItem) ? (
                      <form onSubmit={handleSaveHelpItemSubmit} className="space-y-3.5 bg-slate-50 dark:bg-[#0A1D26] p-4 rounded-2xl border border-[#38CAD6]/30 animate-fadeIn font-sans">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#132F3D] pb-2">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-[#1B6E7D] dark:text-[#48CCD6] flex items-center gap-1">
                            <span>{editingHelpItem ? 'Sửa mục hướng dẫn' : 'Thêm mục hướng dẫn mới'}</span>
                          </h5>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingHelpItem(false);
                              setEditingHelpItem(null);
                            }}
                            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:underline"
                          >
                            Hủy bỏ
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                              Tiêu đề mục hướng dẫn / Câu hỏi FAQ *
                            </label>
                            <input
                              type="text"
                              required
                              value={helpItemTitle}
                              onChange={(e) => setHelpItemTitle(e.target.value)}
                              placeholder="VD: Tìm kiếm & Lọc theo chủ đề"
                              className="w-full px-3.5 py-2 bg-white dark:bg-[#0E232E] rounded-xl border border-slate-200 dark:border-[#132F3D] text-xs text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#38CAD6] focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                              Nhãn Badge (Tùy chọn)
                            </label>
                            <input
                              type="text"
                              value={helpItemBadge}
                              onChange={(e) => setHelpItemBadge(e.target.value)}
                              placeholder="VD: Mẹo hay, Mới, Nổi bật,..."
                              className="w-full px-3.5 py-2 bg-white dark:bg-[#0E232E] rounded-xl border border-slate-200 dark:border-[#132F3D] text-xs text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#38CAD6] focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Nội dung hướng dẫn chi tiết / Câu trả lời FAQ *
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={helpItemDesc}
                            onChange={(e) => setHelpItemDesc(e.target.value)}
                            placeholder="Mô tả các bước thao tác, mẹo hoặc giải đáp thắc mắc chi tiết..."
                            className="w-full px-3.5 py-2 bg-white dark:bg-[#0E232E] rounded-xl border border-slate-200 dark:border-[#132F3D] text-xs text-slate-900 dark:text-white leading-relaxed resize-none focus:ring-1 focus:ring-[#38CAD6] focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Nút hành động "Thử ngay" chuyển hướng (Tùy chọn)
                          </label>
                          <select
                            value={helpItemAction || ''}
                            onChange={(e) => setHelpItemAction((e.target.value as any) || undefined)}
                            className="w-full px-3.5 py-2 bg-white dark:bg-[#0E232E] rounded-xl border border-slate-200 dark:border-[#132F3D] text-xs text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#38CAD6] focus:outline-hidden"
                          >
                            <option value="">Không có nút liên kết</option>
                            <option value="creatorRequest">Mở Hòm Thư Creator (Gửi đơn)</option>
                            <option value="messageBoard">Mở Bảng Tin Lưu Niệm</option>
                            <option value="fortune">Mở Vỏ Sò May Mắn</option>
                            <option value="bgm">Mở Cài Đặt Âm Thanh / Nhạc Nền</option>
                          </select>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#132F3D]">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingHelpItem(false);
                              setEditingHelpItem(null);
                            }}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-[#38CAD6] hover:bg-[#2EB8C4] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-[#38CAD6]/20"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{editingHelpItem ? 'Cập nhật mục' : 'Thêm vào chuyên mục'}</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Items List for Current Category */
                      <div className="space-y-2.5 max-h-[42vh] overflow-y-auto pr-1 custom-scrollbar">
                        {(() => {
                          const currentCat = (helpConfig.categories || DEFAULT_HELP_CENTER_CONFIG.categories).find((c) => c.key === activeHelpCatKey);
                          const items = currentCat?.items || [];
                          if (items.length === 0) {
                            return (
                              <div className="text-center py-10 text-slate-400 font-medium text-xs font-serif">
                                Chuyên mục này chưa có mục hướng dẫn nào. Hãy nhấn "Thêm mục hướng dẫn" để tạo nhé!
                              </div>
                            );
                          }
                          return items.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B1E26] border border-[#38CAD6]/20 flex items-start justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-[#38CAD6]/20 text-[#1B6E7D] dark:text-[#48CCD6] text-[10px] font-bold flex items-center justify-center font-mono shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span className="font-bold text-slate-900 dark:text-white truncate font-serif">
                                    {item.title}
                                  </span>
                                  {item.badge && (
                                    <span className="px-2 py-0.5 rounded-md bg-[#38CAD6]/20 text-[#1B6E7D] dark:text-[#48CCD6] text-[10px] font-bold">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-[#88A9B3] leading-relaxed pl-7 font-serif">
                                  {item.desc}
                                </p>
                                {item.linkAction && (
                                  <div className="pl-7 text-[10px] text-[#1B6E7D] dark:text-[#48CCD6] font-semibold">
                                    ✦ Có nút liên kết: {item.linkAction}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditHelpItem(activeHelpCatKey, item)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-[#132F3D] transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                                  title="Chỉnh sửa mục này"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-[#38CAD6]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteHelpItem(activeHelpCatKey, item.id)}
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                                  title="Xóa mục này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 6: Creator Requests Management */}
              {activeTab === 'requests' && (
                <div className="space-y-6">
                  {/* Header & Filter Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/40">
                    <div>
                      <h4 className="text-sm font-bold font-serif text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <span>♡ Quản Lý Đơn Gửi Đến Creator</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Duyệt, phản hồi hoặc yêu cầu bổ sung các tờ đơn từ người dùng ♡
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
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
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            requestFilter === f.id
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                      <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 font-serif text-xs">
                        ✦ Không có đơn nào trong trạng thái này ♡
                      </div>
                    ) : (
                      adminRequests
                        .filter((r) => requestFilter === 'all' || r.status === requestFilter)
                        .map((req) => {
                          const statusColors = {
                            pending_approval: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
                            approved: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
                            needs_revision: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300',
                            responded: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300',
                            rejected: 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400',
                          };
                          const statusLabels = {
                            pending_approval: '⏳ Đang chờ xác nhận',
                            approved: '✓ Đã xác nhận (Chờ phản hồi)',
                            needs_revision: '⚠️ Cần bổ sung thêm',
                            responded: '💌 Đã phản hồi từ Creator',
                            rejected: '✕ Đã từ chối',
                          };

                          return (
                            <div
                              key={req.id}
                              className="p-5 rounded-2xl bg-gradient-to-b from-[#fffefc] via-[#faf6ee] to-[#f4ede0] dark:from-slate-900 dark:to-slate-900/90 border border-[#e8dfcf] dark:border-slate-800 shadow-sm space-y-4 relative overflow-hidden"
                            >
                              {/* Top decoration ribbon / corner */}
                              <div className="absolute top-0 right-8 w-6 h-10 bg-rose-400 rounded-b-md text-white text-[10px] font-serif flex items-end justify-center pb-1">
                                💌
                              </div>

                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold font-serif text-slate-900 dark:text-white">
                                      {req.senderName}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                      {req.requestType}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-serif">
                                    Gửi lúc: {new Date(req.createdAt).toLocaleString()}
                                  </div>
                                </div>

                                <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${statusColors[req.status] || ''}`}>
                                  {statusLabels[req.status] || req.status}
                                </span>
                              </div>

                              {/* Content */}
                              <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs font-serif leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                                {req.content}
                              </div>

                              {/* Attached Image */}
                              {req.imageUrl && (
                                <div className="space-y-1">
                                  <div className="text-[10px] font-serif opacity-70">Ảnh đính kèm:</div>
                                  <img
                                    src={req.imageUrl}
                                    alt="Request attachment"
                                    className="max-h-48 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                                  />
                                </div>
                              )}

                              {/* Admin Notes / Revisions if any */}
                              {req.adminNote && (
                                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 font-serif space-y-1">
                                  <span className="font-bold">Ghi chú yêu cầu bổ sung của Admin:</span>
                                  <p>{req.adminNote}</p>
                                </div>
                              )}

                              {/* Creator Response if any */}
                              {req.creatorResponse && (
                                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 font-serif space-y-1">
                                  <span className="font-bold">Phản hồi chính thức từ Creator:</span>
                                  <p>{req.creatorResponse}</p>
                                </div>
                              )}

                              {/* Action Controls */}
                              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  {req.status === 'pending_approval' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          await updateCreatorRequest(req.id, { status: 'approved' });
                                          if (onToast) onToast('✓ Đã xác nhận đơn thành công!');
                                        }}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm flex items-center gap-1 cursor-pointer"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Xác nhận đơn</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const note = adminNoteInputs[req.id] || 'Cần bổ sung thêm thông tin';
                                          await updateCreatorRequest(req.id, { status: 'needs_revision', adminNote: note });
                                          if (onToast) onToast('⚠️ Đã yêu cầu bổ sung thông tin');
                                        }}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm flex items-center gap-1 cursor-pointer"
                                      >
                                        <span>Cần bổ sung</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          await updateCreatorRequest(req.id, { status: 'rejected' });
                                          if (onToast) onToast('✕ Đã từ chối đơn');
                                        }}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 transition-colors cursor-pointer"
                                      >
                                        Từ chối
                                      </button>
                                    </>
                                  )}

                                  {/* Creator Reply Form */}
                                  <div className="w-full sm:flex-1 flex items-center gap-2 mt-2">
                                    <input
                                      type="text"
                                      value={creatorReplyInputs[req.id] || ''}
                                      onChange={(e) =>
                                        setCreatorReplyInputs({ ...creatorReplyInputs, [req.id]: e.target.value })
                                      }
                                      placeholder="Viết phản hồi với tư cách Creator..."
                                      className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-serif"
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
                                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                      <span>Gửi phản hồi</span>
                                    </button>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setRequestToDelete(req.id)}
                                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                                  title="Xóa tờ đơn"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              {/* Tab 7: Suggested Avatars Management */}
              {activeTab === 'avatars' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/40">
                    <div>
                      <h4 className="text-sm font-bold font-serif text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <span>🖼️ Quản Lý Avatar Gợi Ý Cho Người Dùng</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Tải lên các mẫu avatar từ tệp thiết bị để người dùng có thể chọn nhanh trong hồ sơ cá nhân ♡
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
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
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
                        className="px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-serif w-full sm:w-44"
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
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh lên</span>
                      </button>
                    </div>
                  </div>

                  {/* Avatars Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {suggestedAvatars.length === 0 ? (
                      <div className="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 font-serif text-xs">
                        ✦ Chưa có avatar gợi ý nào được tải lên ♡
                      </div>
                    ) : (
                      suggestedAvatars.map((item) => (
                        <div
                          key={item.id}
                          className="group relative p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center gap-2"
                        >
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
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
                            className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md cursor-pointer transition-transform active:scale-90"
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

              {/* Tab 9: Application & Presentation Video Layer Management */}
              {activeTab === 'presentation' && (
                <div className="space-y-6">
                  {/* Banner Info */}
                  <div className="p-4 rounded-2xl bg-[#E5F5F7]/70 dark:bg-[#0D2730]/70 border border-[#65C5CE]/30 dark:border-[#143943] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold font-serif text-[#29464C] dark:text-[#DDF5F6] flex items-center gap-1.5">
                        <Film className="w-4 h-4 text-[#3FAAB7] dark:text-[#78DCE0]" />
                        <span>Khu Vực Ứng Dụng & Trình Chiếu Video Đầu Trang</span>
                      </h4>
                      <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC] mt-0.5">
                        Tải video từ tệp để phát lớp hiệu ứng chuyển động mờ ảo ở khu vực đầu trang (Hero). Hỗ trợ xem trước ngay trước khi lưu.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-[#29464C] dark:text-[#DDF5F6] flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={presIsEnabled}
                          onChange={(e) => setPresIsEnabled(e.target.checked)}
                          className="rounded border-[#65C5CE] text-[#3FAAB7] focus:ring-[#3FAAB7] w-4 h-4"
                        />
                        <span>Kích hoạt trình chiếu</span>
                      </label>
                    </div>
                  </div>

                  {/* Video Drag & Drop Upload Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingVideo(true);
                    }}
                    onDragLeave={() => setIsDraggingVideo(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingVideo(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        if (!file.type.startsWith('video/') && !/\.(mp4|webm|ogg|mov|m4v)$/i.test(file.name)) {
                          if (onToast) onToast('⚠️ Vui lòng chọn tệp video hợp lệ (MP4, WebM, MOV, OGG).');
                          return;
                        }
                        const instantUrl = URL.createObjectURL(file);
                        setPresVideoUrl(instantUrl);
                        setPresVideoName(file.name);
                        setPresIsEnabled(true);
                        
                        // Also try to read as dataURL for permanent storage if size is reasonable
                        if (file.size <= 20 * 1024 * 1024) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setPresVideoUrl(ev.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                        if (onToast) onToast(`🎬 Đã tải video "${file.name}"! Bạn có thể xem thử và nhấn Áp dụng.`);
                      }
                    }}
                    className={`p-6 rounded-3xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-3 ${
                      isDraggingVideo
                        ? 'border-[#3FAAB7] bg-[#E5F5F7] dark:bg-[#143943]'
                        : 'border-[#65C5CE]/50 dark:border-[#78DCE0]/30 bg-[#F2FBFC]/50 dark:bg-[#081B22]/50 hover:border-[#3FAAB7]'
                    }`}
                  >
                    <input
                      ref={videoFileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (!file.type.startsWith('video/') && !/\.(mp4|webm|ogg|mov|m4v)$/i.test(file.name)) {
                            if (onToast) onToast('⚠️ Vui lòng chọn tệp video hợp lệ (MP4, WebM, MOV, OGG).');
                            return;
                          }
                          const instantUrl = URL.createObjectURL(file);
                          setPresVideoUrl(instantUrl);
                          setPresVideoName(file.name);
                          setPresIsEnabled(true);

                          if (file.size <= 20 * 1024 * 1024) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setPresVideoUrl(ev.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                          if (onToast) onToast(`🎬 Đã tải video "${file.name}"! Bạn có thể xem thử và nhấn Áp dụng.`);
                        }
                        e.target.value = '';
                      }}
                    />

                    <div className="w-14 h-14 rounded-2xl bg-[#DDF1F3] dark:bg-[#102F38] text-[#247C8C] dark:text-[#78DCE0] flex items-center justify-center shadow-xs">
                      <Video className="w-7 h-7" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#29464C] dark:text-[#DDF5F6] font-serif">
                        Kéo thả tệp video vào đây hoặc chọn từ máy
                      </p>
                      <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC] mt-0.5">
                        Hỗ trợ định dạng MP4, WebM, MOV, OGG. Tự động lặp lại và tắt âm thanh để tạo không gian êm dịu.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{presVideoUrl ? 'Thay video khác từ máy' : 'Chọn tệp video từ máy'}</span>
                    </button>
                  </div>

                  {/* Video Live Preview Box */}
                  {presVideoUrl && (
                    <div className="p-5 rounded-3xl bg-white dark:bg-[#102F38] border border-[#65C5CE]/40 dark:border-[#78DCE0]/25 shadow-md space-y-4">
                      <div className="flex items-center justify-between border-b border-[#65C5CE]/20 dark:border-[#143943] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-serif text-[#29464C] dark:text-[#DDF5F6]">
                            Bản xem trước trực tiếp (Live Preview)
                          </span>
                          {presVideoName && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#E5F5F7] dark:bg-[#0D2730] text-[#247C8C] dark:text-[#78DCE0] truncate max-w-[200px]">
                              {presVideoName}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-[#3FAAB7] dark:text-[#78DCE0] font-semibold">
                          {presIsEnabled ? '🟢 Đang kích hoạt' : '⚪ Đang tắt'}
                        </span>
                      </div>

                      {/* Video Player Display Container */}
                      <div className="relative rounded-2xl overflow-hidden border border-[#65C5CE]/30 dark:border-[#143943] bg-black max-h-64 flex items-center justify-center">
                        <video
                          src={presVideoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                          className="w-full h-auto max-h-64 object-contain"
                          style={{
                            opacity: presOpacity,
                            mixBlendMode: presBlendMode,
                            filter: presBlur > 0 ? `blur(${presBlur}px)` : undefined,
                          }}
                        />
                      </div>

                      {/* Controls Configuration */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        {/* Overlay Opacity Slider */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold text-[#29464C] dark:text-[#DDF5F6]">
                            <span>Độ mờ lớp phủ</span>
                            <span className="font-mono text-[#3FAAB7]">{Math.round(presOpacity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            value={presOpacity}
                            onChange={(e) => setPresOpacity(parseFloat(e.target.value))}
                            className="w-full accent-[#3FAAB7] cursor-pointer"
                          />
                        </div>

                        {/* Blend Mode Select */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#29464C] dark:text-[#DDF5F6]">
                            Chế độ hòa trộn
                          </label>
                          <select
                            value={presBlendMode}
                            onChange={(e) => setPresBlendMode(e.target.value as any)}
                            className="w-full px-3 py-1.5 rounded-xl text-xs bg-[#E5F5F7] dark:bg-[#0D2730] border border-[#65C5CE]/30 text-[#29464C] dark:text-[#DDF5F6] font-serif"
                          >
                            <option value="screen">Screen (Sáng nhẹ biển)</option>
                            <option value="normal">Normal (Bình thường)</option>
                            <option value="overlay">Overlay (Tương phản)</option>
                            <option value="soft-light">Soft Light (Dịu nhẹ)</option>
                          </select>
                        </div>

                        {/* Blur Slider */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold text-[#29464C] dark:text-[#DDF5F6]">
                            <span>Độ mờ nét (Blur)</span>
                            <span className="font-mono text-[#3FAAB7]">{presBlur}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="1"
                            value={presBlur}
                            onChange={(e) => setPresBlur(parseInt(e.target.value, 10))}
                            className="w-full accent-[#3FAAB7] cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#65C5CE]/20 dark:border-[#143943]">
                        <button
                          type="button"
                          onClick={async () => {
                            setPresVideoUrl('');
                            setPresVideoName('');
                            setPresIsEnabled(false);
                            if (onSaveHeroPresentation) {
                              await onSaveHeroPresentation({
                                isEnabled: false,
                                videoUrl: '',
                                videoName: '',
                                overlayOpacity: 0.4,
                                blendMode: 'screen',
                                blurAmount: 0,
                                updatedAt: new Date().toISOString(),
                              });
                            }
                            if (onToast) onToast('🌊 Đã xóa video và tự động quay về hiệu ứng đại dương mặc định!');
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Xóa video và tự động quay về hiệu ứng đại dương mặc định"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Xóa video → Quay về mặc định</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            if (onSaveHeroPresentation) {
                              await onSaveHeroPresentation({
                                isEnabled: presIsEnabled,
                                videoUrl: presVideoUrl,
                                videoName: presVideoName,
                                overlayOpacity: presOpacity,
                                blendMode: presBlendMode,
                                blurAmount: presBlur,
                                updatedAt: new Date().toISOString(),
                              });
                              if (onToast) onToast('✨ Đã áp dụng toàn bộ hiệu ứng trình chiếu cho khu vực đầu trang!');
                            }
                          }}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                        >
                          <Save className="w-4 h-4" />
                          <span>Áp dụng toàn bộ hiệu ứng</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-rose-200 dark:border-rose-900/40 text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center border border-rose-500/20">
                    <Trash2 className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Xác nhận xóa nhân vật?
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Bạn có chắc chắn muốn xóa nhân vật <span className="font-bold text-rose-500">"{characterToDelete.name}"</span>? Thao tác này sẽ xóa vĩnh viễn khỏi hệ thống và không thể khôi phục.
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
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 transition-colors cursor-pointer"
                    >
                      Xóa vĩnh viễn
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* 2. Confirmation Modal for Feature Deletion */}
          <AnimatePresence>
            {featureToDelete && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 10 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-rose-200 dark:border-rose-900/40 text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center border border-rose-500/20">
                    <Trash2 className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Xác nhận xóa tính năng?
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Bạn có chắc chắn muốn xóa tính năng <span className="font-bold text-rose-500">"{featureToDelete.name}"</span> khỏi Sổ tay tính năng?
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setFeatureToDelete(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const { id, name } = featureToDelete;
                        setFeatureToDelete(null);
                        if (onDeleteFeature) {
                          onDeleteFeature(id)
                            .then(() => {
                              if (onToast) onToast(`🗑️ Đã xóa tính năng "${name}" thành công!`);
                            })
                            .catch(() => {
                              if (onToast) onToast('❌ Lỗi khi xóa tính năng.');
                            });
                        }
                      }}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-colors cursor-pointer"
                    >
                      Xác nhận xóa
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* 3. Confirmation Modal for Creator Request Deletion */}
          <AnimatePresence>
            {requestToDelete && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 10 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-rose-200 dark:border-rose-900/40 text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center border border-rose-500/20">
                    <Trash2 className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Xác nhận xóa tờ đơn?
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
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
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-colors cursor-pointer"
                    >
                      Xóa đơn
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* 4. Confirmation Modal for Reset All Votes */}
          <AnimatePresence>
            {isConfirmingResetVotes && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 10 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-rose-200 dark:border-rose-900/40 text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center border border-amber-500/20">
                    <RotateCcw className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Đặt lại 0 tim tất cả?
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Toàn bộ lượt bình chọn tim của tất cả nhân vật sẽ được đặt về 0. Người dùng và Admin sẽ bắt đầu bình chọn lại từ đầu.
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
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-colors cursor-pointer"
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


