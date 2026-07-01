import { useState } from 'react'
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Common/navbar/navbar';
import Footer from './components/Common/footer/footer';
import LandingPage from './components/landingPage';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ForgotPassword from './components/Auth/ForgotPassword';
import ContactPage from './components/Common/contactPage/ContactPage';
import AboutPage from './components/Common/aboutPage/AboutPage';
import ResetPassword from './components/Auth/ResetPassword';
import Whiteboard from './components/Tools/Whiteboard/whiteboard';
import Editor from './components/Tools/CodeEditor/Editor';
import Dashboard from './components/user/Dashboard/Dashboard';
import Workspace from './components/Workspace/Workspace';
import GroupDashboard from './components/Workspace/GroupWorkspace/GroupWorkspace';
import IndividualDashboard from './components/Workspace/IndividualWorkspace/IndividualWorkspace';
import TeamDashboard from './components/Workspace/TeamWorkspace/TeamDashboard';
import CodeEditorDashboard from './components/Tools/CodeEditor/CodeEditorDash/CodeEditorDashboard';
import WorkspacePage from './components/Workspace/workspaceMain';
import SessionPage from './components/Workspace/Session/SessionPage';
import CollectionHome from './components/Workspace/MainContent/CollectionHome';
import SessionHome from './components/Workspace/MainContent/SessionHome';
import CollectionForm from './components/Workspace/MainContent/CollectionForm';
import SessionForm from './components/Workspace/MainContent/SessionForm';
import HomePage from './components/Workspace/homePage';
import EditorWindow from './components/Tools/CodeEditor/EditorWindow';
import Playground from './components/Workspace/IndividualWorkspace/Playground';
import WhiteboardPlayground from './components/Tools/Whiteboard/whiteboardPlayground';
import NotesPlayground from './components/Tools/Notes/NotesPlayground';
import Notepad from './components/Tools/Notes/Notes';
import Blogs from './components/LandingPageCom/blogs/blogs';
import BlogPost from './components/LandingPageCom/blogs/blogPost';
import UserProfile from './components/Auth/UserProfile';
import Resource from './components/LandingPageCom/Resource_Recomendation/resource_recomend';
import CollaborativeEditor from './components/Tools/Collab_editor/collaborative_editor';
import OAuth2RedirectHandler from './components/Auth/OAuth2RedirectHandler';

function App() {
  const location = useLocation();

  // ✅ FIX 1: use path PREFIXES with startsWith instead of exact strings
  // Route patterns like "/workspace/:id" never match real URLs like "/workspace/abc-123"
  const hiddenPrefixes = [
    "/whiteboard",
    "/codeEditor",
    "/dashboard",
    "/workspace",
    "/individual",
    "/codeEditorDash",
    "/group",
    "/playground",
    "/editor",
    "/notepad",
    "/notes-playground",
    "/whiteboard-playground",
    "/code-editor",
    "/blog",
  ];

  const shouldHideLayout = hiddenPrefixes.some(
    (prefix) => location.pathname.startsWith(prefix)
  );

  return (
    <>
      {!shouldHideLayout && <Navbar />}
      <Toaster position="bottom-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/resource" element={<Resource />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blog/:workspaceId/:noteName" element={<BlogPost />} />

        {/* Auth */}
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* Tools */}
        <Route path="/whiteboard" element={<Whiteboard />} />
        <Route path="/whiteboard/:workspaceId/:boardName" element={<Whiteboard />} />
       {/* <Route path="/whiteboard/:workspaceId/:boardName" element={<Whiteboard isCollaborative={true} />} />*/}
        <Route path="/whiteboard-playground/:workspaceId" element={<WhiteboardPlayground />} />
        <Route path="/codeEditor" element={<Editor />} />
        <Route path="/codeEditorDash" element={<CodeEditorDashboard />} />
        <Route path="/code-editor/:workspaceId/:sessionId" element={<EditorWindow />} />
        <Route path="/editor/:workspaceId/:fileName" element={<EditorWindow isCollaborative={false} />} />
        <Route path="/notepad/:workspaceId/:noteName" element={<Notepad isCollaborative={false} />} />
        <Route path="/notes-playground/:workspaceId" element={<NotesPlayground />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Workspace — top-level */}
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/workspace/individual/:workspaceId" element={<IndividualDashboard />} />
        <Route path="/workspace/group/:workspaceId" element={<GroupDashboard />} />
        <Route path="/workspace/team/:workspaceId" element={<TeamDashboard />} />

        {/* ✅ FIX 2: removed duplicate <Route path="/" element={<Workspace />} /> — it was dead code */}

        {/* Workspace nested routes */}
        <Route path="/workspace/:id" element={<WorkspacePage />}>
          <Route index element={<HomePage />} />
          <Route path="workspace/home" element={<HomePage onSave={(data) => console.log(data)} />} />
          <Route path="sessions/new" element={<SessionForm onSave={(data) => console.log(data)} />} />
          <Route path="collections/:collectionId" element={<CollectionHome />} />
          <Route path="sessions/:sessionId" element={<SessionHome />} />
        </Route>
        <Route path="/workspace/:id/session/:sessionId" element={<SessionPage />} />

        {/* Playground */}
        <Route path="/playground/:workspaceId/notes" element={<NotesPlayground />} />
        <Route path="/playground/:workspaceId/collab-editor" element={<CollaborativeEditor />} />
        <Route path="/playground/:workspaceId/:type" element={<Playground />} />
        <Route path="/playground/:workspaceId/:type/new" element={<EditorWindow isCollaborative={false} />} />
      </Routes>
      {!shouldHideLayout && <Footer />}
    </>
  );
}

export default App;
